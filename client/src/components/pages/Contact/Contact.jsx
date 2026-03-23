"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            alert("Thank you for your message! We'll get back to you soon.");
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="bg-(--bg-primary) min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="heading-1 mb-6 text-(--text-primary)">Contact Us</h1>
                    <p className="text-lg text-(--text-secondary) leading-relaxed">
                        Have a question, feedback, or a story idea? We'd love to hear from you.
                        Fill out the form below or reach out to us directly through our contact details.
                    </p>
                </div>
            </section>

            {/* Main Content Section */}
            <section className="py-12 px-6 sm:px-12 lg:px-24 mx-auto max-w-7xl mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Left side: Contact Form */}
                    <div className="lg:col-span-7 bg-(--bg-secondary) p-8 md:p-10 rounded-xl border border-(--border-light) shadow-(--shadow-sm)">
                        <h2 className="heading-3 mb-6 text-(--text-primary)">Send us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="John Doe"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input bg-(--bg-primary) text-(--text-primary)"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="john@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input bg-(--bg-primary) text-(--text-primary)"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="form-label">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    placeholder="How can we help you?"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="form-input bg-(--bg-primary) text-(--text-primary)"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="form-label">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="6"
                                    placeholder="Tell us what's on your mind..."
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="form-input bg-(--bg-primary) text-(--text-primary) resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary w-full py-4 rounded-md text-base font-medium flex justify-center items-center gap-2 mt-4"
                            >
                                {isSubmitting ? 'Sending...' : (
                                    <>
                                        Send Message <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right side: Contact Details */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-(--bg-tertiary) p-8 rounded-lg border border-(--border-light) mb-8">
                            <h3 className="heading-3 mb-4 text-(--text-primary)">Contact Information</h3>
                            <p className="text-body mb-8 text-(--text-secondary)">
                                We're mostly remote, but you can always reach us via email or phone during normal business hours.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-(--brand-primary-light) text-(--brand-primary) rounded-full flex items-center justify-center shrink-0">
                                        <Mail size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-(--text-primary) text-lg mb-1">Email</h4>
                                        <p className="text-body text-sm mb-1">Our friendly team is here to help.</p>
                                        <a href="mailto:hello@newzone.com" className="text-(--brand-primary) font-medium text-sm hover:underline">hello@newzone.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-(--brand-primary-light) text-(--brand-primary) rounded-full flex items-center justify-center shrink-0">
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-(--text-primary) text-lg mb-1">Office</h4>
                                        <p className="text-body text-sm mb-1">Come say hello at our headquarters.</p>
                                        <p className="text-(--text-primary) font-medium text-sm">100 Innovation Drive, Tech City, CA 90210</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-(--brand-primary-light) text-(--brand-primary) rounded-full flex items-center justify-center shrink-0">
                                        <Phone size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-(--text-primary) text-lg mb-1">Phone</h4>
                                        <p className="text-body text-sm mb-1">Mon-Fri from 9am to 6pm.</p>
                                        <a href="tel:+15550000000" className="text-(--text-primary) font-medium text-sm hover:underline">+1 (555) 000-0000</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Block / Socials or FAQs */}
                        <div className="card p-8 rounded-lg border border-(--border-light)">
                            <h3 className="heading-3 mb-2 text-(--text-primary)">Frequently Asked</h3>
                            <p className="text-body text-sm mb-4">You might find what you're looking for in our help center.</p>
                            <Link href="/faqs" className="btn btn-outline w-full justify-center py-2.5">
                                View Help Center
                            </Link>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Contact;
