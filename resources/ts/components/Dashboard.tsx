import { Button } from "./ui/button";
import Wrapper from "./ui/wrapper";



export default function Dashboard() {
    return (
        <Wrapper>
            <main className="flex-1 min-w-0 p-5 sm:p-8">
                <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">داشبورد مدیریت انبار</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant={'default'}>ثبت کالا</Button>
                        <Button variant={'outline'}>ثبت تراکنش</Button>
                    </div>
                </header>
            </main>
        </Wrapper>
    )
}
