'use client'

import { buildCategoryOptionsFromCatalog, queryCatalog } from '@/utils/CategoryUtils';
import { fetchCatalog } from "@/io/category";
import { Catalog, CategoryOptions } from '@/types/categories';

async function fetchTheCatalog() {
    console.log("Begin fetch...");
	const catalog : Catalog = await queryCatalog();
    console.log("Fetch complete.");

    console.log("Catalog:");
    console.log(catalog);
}

async function fetchTheCategoryOptions() {
    console.log("Begin fetch options...");
    const catalog : Catalog = await queryCatalog();
	let categories : CategoryOptions = await buildCategoryOptionsFromCatalog(catalog);
    console.log("Fetch complete.");

    console.log("Catagory options:");
    console.log(categories);
}

export default function Page() {
    fetchTheCatalog();
    fetchTheCategoryOptions();

    return (
        <div className="container mx-auto px-4">
            <div className="w-full h-screen">
            </div>
        </div>
    );
}
