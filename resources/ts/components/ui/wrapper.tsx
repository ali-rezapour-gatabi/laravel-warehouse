import React, { useEffect, useState } from "react";
import { useRoute } from "ziggy-js";
import { Menu, Warehouse, LayoutDashboard, Package, Users, BadgeCheckIcon, CreditCardIcon, LogOutIcon, User, User2 } from "lucide-react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toaster } from "./toast";

type User = {
    first_name: string;
    last_name: string;
    role: string;
    phone_number: string;
};

export async function getCurrentUser(): Promise<User> {
    const res = await fetch("/auth/user", {
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
        },
    });

    if (res.status === 401 || res.status === 403) {
        window.location.assign("/login");
        throw new Error("کاربر احراز هویت نشده است.");
    }

    if (!res.ok) {
        throw new Error("دریافت اطلاعات کاربر ناموفق بود.");
    }

    const data = await res.json();
    return data.user;
}

const navigation = [
    {
        label: "داشبورد مدیریت انبار",
        routeName: "home",
        icon: LayoutDashboard,
    },
    {
        label: "انبارها",
        routeName: "warehouse",
        icon: Warehouse,
    },
    {
        label: "محصولات",
        routeName: "products",
        icon: Package,
    },
    {
        label: "کاربران",
        routeName: "members",
        icon: Users,
    },
];

function Sidebar({ user }: { user: User | null }) {
    const route = useRoute();

    return (
        <aside className="hidden lg:flex w-72 shrink-0 flex-col border-l border-white/10 bg-primary p-5 text-slate-300">
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Warehouse size={23} />
                </div>

                <div>
                    <h2 className="font-bold text-white">
                        انبارداری دریا
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        سیستم مدیریت انبار
                    </p>
                </div>
            </div>

            <p className="mb-3 px-3 text-xs font-medium text-slate-400">
                منوی اصلی
            </p>

            <nav className="space-y-1">
                {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                        <a
                            key={item.routeName}
                            href={route(item.routeName)}
                            className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <Icon size={19} />
                            <span>{item.label}</span>
                        </a>
                    );
                })}
            </nav>
        </aside>
    );
}

const pageInfo: Record<string, { title: string; description: string }> = {
    "/": {
        title: "داشبورد مدیریت انبار",
        description: "نمای کلی وضعیت و عملکرد انبار",
    },
    "/login": {
        title: "ورود به حساب کاربری",
        description: "به پنل مدیریت انبارداری دریا وارد شوید",
    },
    "/warehouse": {
        title: "انبارداری",
        description: "مدیریت و بررسی اطلاعات انبارها",
    },

    "/products": {
        title: "محصولات",
        description: "مدیریت و بررسی اطلاعات محصولات",
    },
};

function Header({ user }: { user: User | null }) {

    const path = window.location.pathname;

    const currentPage = pageInfo[path] ?? {
        title: "پنل مدیریت انبار",
        description: "مدیریت و بررسی اطلاعات انبار",
    };

    return (
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
                <Button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-foreground lg:hidden" aria-label="باز کردن منو" >
                    <Menu size={20} />
                </Button>

                <div className="min-w-0">
                    <h1 className="truncate text-base font-bold text-foreground sm:text-lg">
                        {currentPage.title}
                    </h1>

                    <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
                        {currentPage.description}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" className='py-5.5 px-4 flex justify-between items-center'>
                        <User2 className="size-6" />
                        {user?.first_name + " " + user?.last_name}
                    </Button>} />
                    <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <User size={20} />
                                ویرایش کاربر
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-xs text-destructive py-3'>
                            <LogOutIcon />
                            خروج
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </header >
    );
}

export default function Wrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getCurrentUser()
            .then((currentUser) => {
                if (!cancelled) {
                    setUser(currentUser);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("دریافت اطلاعات کاربر با خطا مواجه شد.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div dir="rtl" className="flex min-h-screen bg-muted/30 text-foreground">
            <Sidebar user={user} />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header user={user} />
                <main className="min-w-0 flex-1 p-4 sm:p-3 lg:p-5">
                    {children}
                    <Toaster />
                </main>
            </div>
        </div>
    );
}
