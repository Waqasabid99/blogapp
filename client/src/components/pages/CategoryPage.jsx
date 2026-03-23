"use client";

import { useState } from "react";
import { Pagination, PostCard } from "../ui/PostCard";

const CategoryPage = ({ posts, category, pagination }) => {
    const [page, setPage] = useState(1)
    return (
        <section className="py-12 px-6">
            <div className="mb-12">
                <h1 className="heading-2 font-serif uppercase">{category}</h1>
            </div>
            <div className="pg-grid">
                {posts?.map((post) => (
                    <PostCard key={post?.id} post={post} showActions={false} showAuthor={false} showStatus={false} showCategories={false} showTags={false} />
                ))}
            </div>
            <div className="mt-12">
                <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
        </section>
    )
}

export default CategoryPage