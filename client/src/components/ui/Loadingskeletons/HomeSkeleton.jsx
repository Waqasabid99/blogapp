import { STYLES } from "@/app/styles/postgridStyles";
import { CardSkeleton, RowSkeleton } from "./PostSkeleton";

const HomeSkeleton = () => {
    return (
        <>
            <style>{STYLES}</style>
            <div className="animate-pulse">
                {/* HERO SKELETON */}
                <section className="mx-auto px-6 pt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-none md:grid-rows-3 gap-4">
                        <div
                            className="md:row-span-3 h-full min-h-[400px] pg-skel"
                            style={{ borderRadius: "12px" }}
                        ></div>
                        <RowSkeleton />
                        <RowSkeleton />
                        <RowSkeleton />
                    </div>
                </section>

                {/* LATEST POSTS SKELETON */}
                <section className="px-7 py-12">
                    <div
                        className="pg-skel mb-8"
                        style={{ height: "40px", width: "250px", borderRadius: "8px" }}
                    ></div>
                    <div className="pg-grid">
                        {[...Array(6)].map((_, i) => (
                            <CardSkeleton key={`latest-${i}`} />
                        ))}
                    </div>
                </section>

                {/* TRENDING POSTS SKELETON */}
                <section className="px-7 pb-12">
                    <div
                        className="pg-skel mb-8"
                        style={{ height: "40px", width: "300px", borderRadius: "8px" }}
                    ></div>
                    <div className="pg-grid">
                        {[...Array(6)].map((_, i) => (
                            <CardSkeleton key={`trending-${i}`} />
                        ))}
                    </div>
                </section>

                {/* NEWSLETTER SKELETON */}
                <section
                    className="px-7 py-24 text-center border-t border-b"
                    style={{
                        borderColor: "var(--border-light)",
                        backgroundColor: "var(--bg-secondary)",
                    }}
                >
                    <div className="max-w-2xl mx-auto flex flex-col items-center">
                        <div
                            className="pg-skel mb-4"
                            style={{ height: "48px", width: "70%", borderRadius: "8px" }}
                        ></div>
                        <div
                            className="pg-skel mb-8"
                            style={{ height: "24px", width: "90%", borderRadius: "8px" }}
                        ></div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
                            <div
                                className="flex-1 pg-skel"
                                style={{ height: "48px", borderRadius: "8px" }}
                            ></div>
                            <div
                                className="w-full sm:w-32 pg-skel"
                                style={{ height: "48px", borderRadius: "8px" }}
                            ></div>
                        </div>
                    </div>
                </section>

                {/* POST CATEGORY SKELETON */}
                <section className="px-7 py-12">
                    <div
                        className="pg-skel mb-8"
                        style={{ height: "32px", width: "200px", borderRadius: "8px" }}
                    ></div>
                    <div className="pg-grid mt-3">
                        {[...Array(3)].map((_, i) => (
                            <CardSkeleton key={`category-${i}`} />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default HomeSkeleton;
