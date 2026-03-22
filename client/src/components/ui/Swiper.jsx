"use client";

import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { PostCard } from "./PostCard";
import { STYLES } from "@/app/styles/postgridStyles";

const HeroSlider = ({ posts }) => {
  return (
    <>
      <style>{STYLES}</style>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className="w-full"
      >
        {posts?.map((post) => (
          <SwiperSlide key={post.id}>
            <PostCard
              post={post}
              showStatus={false}
              showAuthor={false}
              showActions={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};

export default HeroSlider;
