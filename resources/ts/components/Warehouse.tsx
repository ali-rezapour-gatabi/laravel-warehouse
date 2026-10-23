import React from "react";
import Wrapper from "./ui/wrapper";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Search, Plus, RefreshCw, AlertCircle, Edit, } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "./ui/toast";
import { formatDate } from "@/lib/utils";
import { Switch } from "./ui/switch";
import OperationWarehouseModal from "./common/OperationWarehouseModal";

export type WarehouseForm = {
    id: number;
    name: string;
    description: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};


export default function Warehouse() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [warehouses, setWarehouses] = React.useState<WarehouseForm[]>([]);
    const [search, setSearch] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [editWarehouse, setEditWarehouse] = React.useState<WarehouseForm | null>(null);

    const openModalHandler = (warehouse: WarehouseForm | null) => {
        setEditWarehouse(warehouse);
        setIsOpen(true);
    }

    const fetchWarehouses = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/warehouses/list", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.status === 401 || response.status === 403) {
                window.location.assign("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("دریافت فهرست انبارها ناموفق بود.");
            }

            const result = await response.json();
            const items = result.data ?? result.result;

            if (!Array.isArray(items)) {
                throw new Error("ساختار پاسخ سرور معتبر نیست.");
            }

            setWarehouses(items);
        } catch (err) {
            toast.add({
                title: "خطا در ارتباط با سرور",
                description: err instanceof Error ? err.message : "",
                type: "error",
                timeout: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        void fetchWarehouses();
    }, [fetchWarehouses]);

    const filteredWarehouses = React.useMemo(() => {
        const query = search.trim().toLocaleLowerCase();

        if (!query) return warehouses;

        return warehouses.filter((warehouse) =>
            [
                warehouse.name,
                warehouse.description ?? "",
            ].some((value) =>
                value.toLocaleLowerCase().includes(query)
            )
        );
    }, [warehouses, search]);


    const handleWarehouseStatusChange = async (id: number, status: boolean) => {
        const res = await fetch('/warehouses/edit/status', {
            method: 'PATCH',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id,
                is_active: status,
            })
        })
        const data = await res.json();
        if (!res.ok) {
            toast.add({
                title: data.message ?? 'خطا در ارتباط با سرور',
                description: 'با خطا در ارتباط با سرور به روز رسانی انبارها می شوید.',
                type: 'error',
                timeout: 2000,
            })
        }
        else {
            toast.add({
                title: status ? 'انبار فعال شد.' : 'انبار غیرفعال شد.',
                description: 'به روز رسانی انبارها با موفقیت انجام شد.',
                type: 'success',
                timeout: 2000,
            })
            if (warehouses) {
                setWarehouses((prev) =>
                    prev.map((warehouse) => warehouse.id === id ? { ...warehouse, is_active: status } : warehouse)
                );
            }
        }
    }


    return (
        <Wrapper>
            <div dir="rtl" className="mx-auto w-full space-y-6">
                <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative">
                            <Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="جست‌وجوی انبار..."
                                aria-label="جست‌وجوی انبار"
                                className="h-11 w-full bg-background pr-10 pl-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:w-84"
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void fetchWarehouses()}
                                disabled={isLoading}
                                className="size-11"
                            >
                                <RefreshCw
                                    size={16}
                                    className={isLoading ? "animate-spin" : ""}
                                />
                            </Button>
                            <Button onClick={() => openModalHandler(null)} className="h-11 gap-2 px-5">
                                <Plus size={18} />
                                افزودن انبار جدید
                            </Button>
                        </div>
                    </div>

                    <div className="warehouse-scrollbar w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-12 w-16 text-center">ردیف</TableHead>
                                    <TableHead className="h-12 w-48 text-right">نام انبار</TableHead>
                                    <TableHead className="h-12 w-36 text-right">لوکیشن ها</TableHead>
                                    <TableHead className="h-12 w-90 text-right">توضیحات</TableHead>
                                    <TableHead className="h-12 w-32 text-right">وضعیت</TableHead>
                                    <TableHead className="h-12 w-40 text-right">آخرین تغییر</TableHead>
                                    <TableHead className="h-12 w-20 text-center">عملیات</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {isLoading && warehouses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48">
                                            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                                <RefreshCw
                                                    size={25}
                                                    className="animate-spin text-primary"
                                                />
                                                <span className="text-sm">
                                                    در حال دریافت انبارها...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-48">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <AlertCircle
                                                    size={28}
                                                    className="text-destructive"
                                                />
                                                <p className="text-sm text-destructive">
                                                    {error}
                                                </p>
                                                <Button variant="outline" size="sm" onClick={() => void fetchWarehouses()} >
                                                    تلاش مجدد
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredWarehouses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-56">
                                            <div className="flex flex-col items-center justify-center px-4 text-center">
                                                <p className="mt-4 font-semibold text-foreground">
                                                    {search ? "انبانی پیدا نشد" : "هنوز انباری ثبت نشده است"}
                                                </p>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {search ? "عبارت جست‌وجو را تغییر دهید." : "برای شروع، اولین انبار خود را ایجاد کنید."}
                                                </p>
                                                {!search && (
                                                    <Button
                                                        size="sm"
                                                        className="mt-4 gap-2 rounded-xl"
                                                        onClick={() => setIsOpen(true)}
                                                    >
                                                        <Plus size={16} />
                                                        ایجاد اولین انبار
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredWarehouses.map(
                                        (warehouse, index) => (
                                            <TableRow key={warehouse.id} className="transition-colors hover:bg-muted/30">
                                                <TableCell className="text-center text-xs tabular-nums text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell>
                                                    <p className="font-semibold text-foreground">
                                                        {warehouse.name}
                                                    </p>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        تعریف نشده
                                                    </span>
                                                </TableCell>

                                                <TableCell>
                                                    <p className="max-w-90 truncate text-muted-foreground text-[12px]" title={warehouse.description ?? ""} >
                                                        {warehouse.description || "بدون توضیحات"}
                                                    </p>
                                                </TableCell>

                                                <TableCell>
                                                    <Switch checked={warehouse.is_active} onCheckedChange={() => void handleWarehouseStatusChange(warehouse.id, !warehouse.is_active)} />
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                                                        {formatDate(warehouse.updated_at ?? warehouse.created_at)}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button type="button" className="h-9 w-9 rounded-lg" variant="link" onClick={() => openModalHandler(warehouse)}>
                                                        <Edit size={19} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </section>

                <OperationWarehouseModal isOpen={isOpen} setIsOpen={setIsOpen} wearhouse={editWarehouse} />
            </div>
        </Wrapper>
    );
}
