
import React from "react";
import { Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "../ui/toast";
import { WarehouseForm } from "../Warehouse";


type WarehouseModalProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    wearhouse?: WarehouseForm | null;
};

export default function OperationWarehouseModal({ isOpen, setIsOpen, wearhouse }: WarehouseModalProps) {
    const [form, setForm] = React.useState<WarehouseForm>({ id: 0, name: "", description: "" });
    const [errors, setErrors] = React.useState<Partial<Record<keyof WarehouseForm, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [serverError, setServerError] = React.useState("");
    const nameInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!isOpen) {
            setForm({ id: 0, name: "", description: "" });
            setErrors({});
            setServerError("");
            setIsSubmitting(false);
            return;
        }

        if (wearhouse) {
            setForm({
                id: wearhouse.id,
                name: wearhouse.name,
                description: wearhouse.description ?? "",
            });
        } else {
            setForm({ id: 0, name: "", description: "" });
            setErrors({});
            setServerError("");
            setIsSubmitting(false);
        }
    }, [isOpen, wearhouse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value, }));
        setErrors((prev) => ({ ...prev, [name]: undefined, }));
        setServerError("");
    };

    const validate = () => {
        const nextErrors: typeof errors = {};

        if (!form.name.trim()) {
            nextErrors.name = "لطفاً نام انبار را وارد کنید.";

        } else if (form.name.trim().length > 100) {
            nextErrors.name = "نام انبار نباید بیشتر از ۱۰۰ کاراکتر باشد.";
        }

        if (form.description && form.description.length > 500) {
            nextErrors.description = "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد.";
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validate()) {
            nameInputRef.current?.focus();
            return;
        }

        setIsSubmitting(true);
        setServerError("");

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

            if (!csrfToken) {
                throw new Error("توکن امنیتی صفحه پیدا نشد.");
            }

            const response = await fetch("/warehouses/create", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    name: form.name,
                    description: form.description || null,
                }),
            });

            const data = await response.json();

            if (response.status === 422 && data.errors) {
                const nextErrors: typeof errors = {};

                for (const field of ["name", "description"] as const) {
                    const message = data.errors[field]?.[0];

                    if (message) {
                        nextErrors[field] = message;
                    }
                }

                setErrors(nextErrors);

                if (nextErrors.name) {
                    nameInputRef.current?.focus();
                } else if (Object.keys(nextErrors).length === 0) {
                    setServerError(data.message ?? "اطلاعات واردشده معتبر نیست.");
                }

                return;
            }

            if (!response.ok) {
                setServerError(data.message ?? "ثبت انبار با خطا مواجه شد.");
            }
            if (response.ok) {
                toast.add({
                    title: "انبار اضافه شد",
                    description: "انبار با موفقیت اضافه شد.",
                    type: "success",
                    timeout: 2000,
                })
                setIsOpen(false);
            }
        } catch (error) {
            setServerError(error instanceof Error ? error.message : "خطای غیرمنتظره‌ای رخ داد.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!isSubmitting) { setIsOpen(open); } }}>
            <DialogContent dir="rtl" className="gap-0 overflow-hidden rounded-2xl border-border/70 p-0 sm:max-w-lg" showCloseButton={false} >
                <DialogHeader className="relative border-b bg-muted/20 px-6 py-5 text-right sm:text-right">
                    <div className="flex items-center gap-3 justify-between">
                        <DialogTitle className="text-lg font-bold">
                            افزودن انبار جدید
                        </DialogTitle>

                        <Button type="button" variant="destructive" size="icon" className="size-9 shrink-0 rounded-lg" disabled={isSubmitting} onClick={() => setIsOpen(false)} aria-label="بستن پنجره" >
                            <X className="size-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-5 px-6 py-6">
                        <div className="space-y-2">
                            <label htmlFor="warehouse-name" className="text-sm font-medium" >
                                عنوان انبار <span className="mr-1 text-destructive"> * </span>
                            </label>
                            <Input
                                ref={nameInputRef}
                                id="warehouse-name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="به عنوان مثال انبار مرکزی"
                                autoComplete="off"
                                maxLength={255}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "warehouse-name-error" : undefined}
                                className="h-11 rounded-lg mt-1"
                            />

                            {errors.name && (
                                <p id="warehouse-name-error"
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <label htmlFor="warehouse-description" className="text-sm font-medium">
                                    توضیحات
                                </label>

                                <span className="text-xs text-muted-foreground">
                                    {form.description && form.description.length}/500
                                </span>
                            </div>

                            <Textarea
                                id="warehouse-description"
                                name="description"
                                value={form.description ?? ""}
                                onChange={handleChange}
                                placeholder="توضیحات اختیاری درباره انبار..."
                                maxLength={500}
                                disabled={isSubmitting}
                                aria-invalid={!!errors.description}
                                aria-describedby={errors.description ? "warehouse-description-error" : undefined}
                                className="min-h-28 resize-y rounded-lg"
                            />

                            {errors.description && (
                                <p id="warehouse-description-error" role="alert" className="text-xs text-destructive" >
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {serverError && (
                            <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" >
                                {serverError}
                            </div>
                        )}
                    </div>

                    <div className="border-t bg-muted/10 px-6 py-4">
                        <Button type="submit" className="w-full h-11" disabled={isSubmitting} >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="ml-2 size-4 animate-spin" />
                                    در حال ثبت...
                                </>
                            ) : (wearhouse ? "ثبت انبار" : "افزودن انبار")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
