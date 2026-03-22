"use client";
import { STYLES } from '@/app/styles/postgridStyles';
import { PostRow } from '@/components/ui/PostCard';
import HeroSlider from '@/components/ui/Swiper';

const Hero = ({ latestPosts, sliderPosts }) => {
  return (
    <>
      <style>{STYLES}</style>
      <section className="mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-none md:grid-rows-3 gap-4">

          {/* SLIDER */}
          {sliderPosts?.length === 0 || sliderPosts === undefined || sliderPosts === null ? (
            null
          ): (
          <div className="md:row-span-3 h-full">
            <HeroSlider posts={sliderPosts}/>
          </div>
          )}

          {/* POSTS */}
          {latestPosts?.slice(0, 3).map((post) => (
            <PostRow
              key={post.id}
              id={post.id}
              post={post}
              showActions={false}
              showCategories={false}
              showDate={true}
              showTags={false}
              showAuthor={false}
              showStatus={false}
            />
          ))}

        </div>
      </section>
    </>
  );
};

export default Hero;