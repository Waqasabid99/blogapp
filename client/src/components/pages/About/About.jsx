import React from 'react';
import Link from 'next/link';
import { BookOpen, Users, Globe, Target, Edit3 } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-(--bg-primary) min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="heading-1 mb-6 text-(--text-primary)">About NEWZONE</h1>
                    <p className="text-lg text-(--text-secondary) leading-relaxed">
                        Your go-to source for the latest insights, stories, and ideas from our community of writers and thinkers. We believe in the power of words to inspire, educate, and connect people across the globe.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl">
                <div className="bg-(--bg-secondary) rounded-xl p-8 md:p-12 shadow-(--shadow-sm) border border-(--border-light)">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="heading-2 mb-6 text-(--text-primary)">Our Mission</h2>
                            <p className="text-body mb-4">
                                At NEWZONE, our mission is to provide a platform where brilliant minds can share their knowledge and stories with the world. We strive to curate high-quality content that not only informs but also challenges the status quo.
                            </p>
                            <p className="text-body mb-8">
                                Whether you're looking for deep dives into technology, creative inspiration, or thoughtful opinion pieces, NEWZONE is designed to be your daily destination for intellectual growth and discovery.
                            </p>
                            <Link href="/contact" className="btn btn-primary px-6 py-3 rounded-md transition-all">
                                Get in Touch
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card text-center flex flex-col items-center justify-center p-6 rounded-lg bg-(--bg-primary) border border-(--border-light)">
                                <Users size={32} className="text-(--brand-primary) mb-3" />
                                <h3 className="heading-3 mb-1 text-(--text-primary)">10K+</h3>
                                <p className="text-sm text-(--text-muted)">Active Readers</p>
                            </div>
                            <div className="card text-center flex flex-col items-center justify-center p-6 rounded-lg mt-8 bg-(--bg-primary) border border-(--border-light)">
                                <BookOpen size={32} className="text-(--brand-primary) mb-3" />
                                <h3 className="heading-3 mb-1 text-(--text-primary)">500+</h3>
                                <p className="text-sm text-(--text-muted)">Published Articles</p>
                            </div>
                            <div className="card text-center flex flex-col items-center justify-center p-6 rounded-lg -mt-8 bg-(--bg-primary) border border-(--border-light)">
                                <Globe size={32} className="text-(--brand-primary) mb-3" />
                                <h3 className="heading-3 mb-1 text-(--text-primary)">50+</h3>
                                <p className="text-sm text-(--text-muted)">Countries Reached</p>
                            </div>
                            <div className="card text-center flex flex-col items-center justify-center p-6 rounded-lg bg-(--bg-primary) border border-(--border-light)">
                                <Target size={32} className="text-(--brand-primary) mb-3" />
                                <h3 className="heading-3 mb-1 text-(--text-primary)">1</h3>
                                <p className="text-sm text-(--text-muted)">Shared Vision</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values / Offerings Section */}
            <section className="py-20 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="heading-2 mb-4 text-(--text-primary)">What Sets Us Apart</h2>
                    <p className="text-body max-w-2xl mx-auto">
                        We aren't just another blogging platform. We are a community-driven ecosystem nurturing creativity and authenticity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card p-8 rounded-lg border border-(--border-light) hover:border-(--brand-primary) transition-all">
                        <div className="w-12 h-12 bg-(--brand-primary-light) text-(--brand-primary) rounded-full flex items-center justify-center mb-6">
                            <Edit3 size={24} />
                        </div>
                        <h3 className="heading-3 mb-3 text-(--text-primary)">Creative Freedom</h3>
                        <p className="text-body text-sm">
                            Our authors enjoy complete editorial independence, allowing their unique voices to shine through without restrictive guidelines.
                        </p>
                    </div>

                    <div className="card p-8 rounded-lg border border-(--border-light) hover:border-(--brand-primary) transition-all">
                        <div className="w-12 h-12 bg-(--brand-primary-light) text-(--brand-primary) rounded-full flex items-center justify-center mb-6">
                            <Users size={24} />
                        </div>
                        <h3 className="heading-3 mb-3 text-(--text-primary)">Vibrant Community</h3>
                        <p className="text-body text-sm">
                            Engage with a diverse group of readers and writers who are as passionate about ideas, stories, and growth as you are.
                        </p>
                    </div>

                    <div className="card p-8 rounded-lg border border-(--border-light) hover:border-(--brand-primary) transition-all">
                        <div className="w-12 h-12 bg-(--brand-primary-light) text-(--brand-primary) rounded-full flex items-center justify-center mb-6">
                            <Globe size={24} />
                        </div>
                        <h3 className="heading-3 mb-3 text-(--text-primary)">Global Reach</h3>
                        <p className="text-body text-sm">
                            Share your perspective with an international audience. Our platform crosses borders and brings cultures together.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team / Join Us CTA */}
            <section className="py-20 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl text-center mb-12">
                <div className="bg-(--bg-tertiary) p-10 md:p-16 rounded-xl border border-(--border-medium) hover:border-(--border-dark) transition-all">
                    <h2 className="heading-2 mb-6 text-(--text-primary)">Join Our Community</h2>
                    <p className="text-body max-w-2xl mx-auto mb-10">
                        We are always looking for passionate writers and creators to join our growing community. If you have a story to tell or expertise to share, we would love to hear from you.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/register" className="btn btn-primary px-8 py-3 rounded-md text-base transition-colors font-medium">
                            Start Writing
                        </Link>
                        <Link href="/blog" className="btn btn-outline px-8 py-3 rounded-md text-base transition-colors font-medium">
                            Read Our Blog
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
