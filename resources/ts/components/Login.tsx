"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const toEnglishDigits = (s: any) =>
    s
        .replace(/[۰-۹]/g, (d: any) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, (d: any) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

const isValidMobile = (v: any) => /^09\d{9}$/.test(v);

export default function Login() {
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [touched, setTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<String | null>(null);

    const mobileError = touched && !isValidMobile(mobile);

    async function handleSubmit(e: any) {
        e.preventDefault();
        setTouched(true);

        if (!isValidMobile(mobile) || password.length < 4) setServerError("شماره موبایل یا رمز عبور اشتباه است.");

        setServerError(null);
        setLoading(true);
        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            if (!csrfToken) {
                return setServerError("خطای داخلی رخ داده است. لطفا بعدا تلاش کنید.");
            }
            const response = await fetch('/login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    phone_number: mobile,
                    password,
                }),
            })

            if (response.redirected) {
                window.location.assign(response.url);
                return;
            }

            if (!response.ok) {
                setServerError("شماره موبایل یا رمز عبور اشتباه است.");
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <main dir="rtl" className="min-h-screen bg-[#F2F7F7] text-[#14204F] flex justify-center items-center">
            <div className="w-full max-w-md border rounded-xl p-3">
                <h1 className="text-2xl font-extrabold leading-tight text-center shadow-2xl">
                    مدریت انبار و موجودی کالا دریا
                </h1>
                <form onSubmit={handleSubmit} className="mt-10 space-y-5" noValidate>
                    <div className="space-y-2">
                        <label htmlFor="mobile" className="text-sm font-medium">
                            شماره موبایل
                        </label>
                        <Input
                            id="mobile"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            maxLength={11}
                            placeholder="شماره موبایل"
                            value={mobile}
                            onChange={(e) => setMobile(toEnglishDigits(e.target.value))}
                            onBlur={() => setTouched(true)}
                            aria-invalid={mobileError}
                            className={`h-12 rounded-xl bg-white text-right tracking-widest ${mobileError
                                ? "border-red-500 focus-visible:ring-red-500"
                                : "border-[#14204F]/15 focus-visible:ring-[#1FA99B]"
                                }`}
                        />
                        {mobileError && (
                            <p className="text-xs text-red-600">
                                شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium">
                                رمز عبور
                            </label>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPass ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 rounded-xl border-[#14204F]/15 bg-white pl-12 focus-visible:ring-[#1FA99B]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                aria-label={showPass ? "پنهان کردن رمز" : "نمایش رمز"}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#14204F]/50 hover:text-[#14204F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1FA99B]"
                            >
                                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 w-full bg-primary text-base font-bold "
                    >
                        {loading ? (
                            <>
                                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                در حال ورود
                            </>
                        ) : (
                            "ورود"
                        )}
                    </Button>
                    {serverError && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                        >
                            {serverError}
                        </p>
                    )}
                </form>
            </div>
        </main>
    );
}
