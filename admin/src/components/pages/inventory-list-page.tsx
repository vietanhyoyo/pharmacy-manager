'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { EditorDialog } from '@/components/dialogs/editor-dialog';
import { PageError, PageLoading } from '@/components/admin/page-feedback';
import { PageHeader } from '@/components/admin/page-header';
import { AppTable, number } from '@/components/inventory-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { getIssues } from '@/lib/api/issues.api';
import { getLots } from '@/lib/api/lots.api';
import { getMovements } from '@/lib/api/movements.api';
import { getProducts } from '@/lib/api/products.api';
import { getReceipts } from '@/lib/api/receipts.api';
import { getStock } from '@/lib/api/stock.api';
import { getSuppliers } from '@/lib/api/suppliers.api';
import type { InventoryListResponse, InventoryListSection, Lot, Product, Supplier } from '@/lib/api/res/inventory.res';
import { pageMetadata } from '@/lib/navigation';
import { useAdminStore } from '@/lib/store';
import type { Section } from '@/lib/types';

type EditableItem = Product | Lot | Supplier;

const listLoaders = {
  products: getProducts,
  lots: getLots,
  stock: getStock,
  receipts: getReceipts,
  issues: getIssues,
  suppliers: getSuppliers,
  movements: getMovements,
} satisfies Record<InventoryListSection, () => Promise<InventoryListResponse>>;

export function InventoryListPage({ section }: { section: InventoryListSection }) {
  const revision = useAdminStore(state => state.revision);
  const refresh = useAdminStore(state => state.refresh);
  const loadLookups = useAdminStore(state => state.loadLookups);
  const [loaded, setLoaded] = useState<{ key: string; data: InventoryListResponse; error: string } | null>(null);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<{ section: Section; item?: EditableItem } | null>(null);
  const requestKey = `${section}:${revision}`;
  const loading = loaded?.key !== requestKey;
  const error = loading ? '' : loaded.error;

  useEffect(() => {
    let active = true;
    listLoaders[section]()
      .then(data => { if (active) setLoaded({ key: requestKey, data, error: '' }); })
      .catch(cause => { if (active) setLoaded({ key: requestKey, data: [], error: cause instanceof Error ? cause.message : 'Không tải được dữ liệu' }); });
    return () => { active = false; };
  }, [requestKey, section]);

  const rows = useMemo(() => (loaded?.key === requestKey ? loaded.data : []).filter(row =>
    JSON.stringify(row).toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')),
  ), [loaded, requestKey, search]);

  function onSaved() {
    setEditor(null);
    refresh();
    void loadLookups();
  }

  return (
    <>
      <PageHeader section={section} onAction={() => setEditor({ section })} />
      {error && <PageError message={error} onRetry={refresh} />}
      {loading ? <PageLoading /> : (
        <Card className="gap-0">
          <CardHeader className="border-b pb-4">
            <CardTitle>{pageMetadata[section].listTitle}</CardTitle>
            <CardDescription>Tra cứu và theo dõi dữ liệu trong kho thuốc</CardDescription>
            <CardAction><Badge variant="secondary">{number(rows.length)} mục</Badge></CardAction>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <InputGroup className="max-w-md">
                <InputGroupAddon><Search className="size-4" /></InputGroupAddon>
                <InputGroupInput aria-label="Tìm kiếm trong danh sách" placeholder="Tìm kiếm trong danh sách..." value={search} onChange={event => setSearch(event.target.value)} />
              </InputGroup>
              <Button variant="outline" onClick={refresh}><RefreshCw />Làm mới</Button>
            </div>
            <AppTable key={`${section}:${search}`} section={section} rows={rows} onEdit={item => setEditor({ section, item })} />
          </CardContent>
        </Card>
      )}
      <EditorDialog key={`${editor?.section}-${editor?.item?.id || 'new'}`} editor={editor} onClose={() => setEditor(null)} onSaved={onSaved} />
    </>
  );
}
