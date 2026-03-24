import { CardSkeleton } from "./PostSkeleton";
const CategorySkeleton = () => {
    return (
        <section className="py-12 px-6">
            <div className="mb-12">
                <h1 className="bg-gray-200 animate-pulse w-40 h-10"></h1>
            </div>
            <div className="pg-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </section>
    )
}

export default CategorySkeleton