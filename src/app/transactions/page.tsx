import Transactions from "@/app/transactions/Transactions";



async function Page() {
    return (
        <div className="container mx-auto px-4">
            <div className="w-full h-screen">
                <Transactions />
            </div>
        </div>
    );
}



export default Page;

