"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const faqData = [
    {
        question: "Do I need an account to read articles?",
        answer: "No, you can read most of our articles freely without an account. However, creating an account allows you to bookmark posts, leave comments, and customize your feed."
    },
    {
        question: "How can I become a writer for NEWZONE?",
        answer: "We are always looking for fresh perspectives! You can apply to become a writer by registering an account and visiting the 'Write for Us' section in your user dashboard."
    },
    {
        question: "Are the articles peer-reviewed?",
        answer: "While we do not follow a formal academic peer-review process, all articles submitted by our community undergo an editorial review to ensure quality, accuracy, and adherence to our community guidelines."
    },
    {
        question: "How do I report an inappropriate comment or article?",
        answer: "Every article and comment has a 'Report' flag icon next to it. Clicking this will send a notification directly to our moderation team who will review the content within 24 hours."
    },
    {
        question: "Can I delete or deactivate my account?",
        answer: "Yes, you can permanently delete or temporarily deactivate your account at any time from your Profile Settings. Please note that deleting your account will permanently remove all your published content."
    }
];

const FAQItem = ({ faq, isOpen, onClick }) => {
    return (
        <div className={`border border-(--border-light) rounded-lg mb-4 overflow-hidden transition-all duration-300 ${isOpen ? 'bg-(--bg-secondary) shadow-(--shadow-sm)' : 'bg-(--bg-primary) hover:border-(--border-medium)'}`}>
            <button
                type="button"
                className="w-full flex justify-between items-center p-6 text-left cursor-pointer"
                onClick={onClick}
            >
                <h3 className="heading-3 text-base sm:text-lg text-(--text-primary) pr-8">{faq.question}</h3>
                <ChevronDown
                    size={20}
                    className={`text-(--brand-primary) shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 pt-0 text-body text-(--text-secondary)">
                    {faq.answer}
                </div>
            </div>
        </div>
    );
};

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="bg-(--bg-primary) min-h-screen py-16 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="heading-1 mb-6 text-(--text-primary)">Frequently Asked Questions</h1>
                    <p className="text-lg text-(--text-secondary) max-w-2xl mx-auto">
                        Have questions? We're here to help. If you don't see your question answered below,
                        feel free to reach out to our support team.
                    </p>
                </div>

                <div className="space-y-4 mb-16">
                    {faqData.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>

                <div className="text-center bg-(--bg-tertiary) p-10 md:p-16 rounded-xl border border-(--border-light)">
                    <h2 className="heading-2 mb-4 text-(--text-primary)">Still have questions?</h2>
                    <p className="text-body mb-8 max-w-xl mx-auto">
                        Can't find the answer you're looking for? Our team is happy to help you with any inquiries you might have.
                    </p>
                    <Link href="/contact" className="btn btn-primary px-8 py-3 rounded-md">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQs;
