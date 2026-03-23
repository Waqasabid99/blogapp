"use client";

import React from 'react';
import Link from 'next/link';

const CookiePolicy = () => {
    const lastUpdated = "March 24, 2026";

    return (
        <div className="bg-(--bg-primary) min-h-screen py-16 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto bg-(--bg-secondary) p-8 md:p-16 rounded-lg border border-(--border-light) shadow-(--shadow-sm)">
                <div className="mb-12 border-b border-(--border-light) pb-8">
                    <h1 className="heading-1 mb-4 text-(--text-primary)">Cookie Policy</h1>
                    <p className="text-(--text-secondary) text-sm">Last Updated: {lastUpdated}</p>
                </div>

                <div className="space-y-10 text-(--text-primary)">
                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">1. What Are Cookies?</h2>
                        <p className="text-body mb-4">
                            Cookies are small text files that are stored on your computer or mobile device when you visit a website.
                            They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">2. How We Use Cookies</h2>
                        <p className="text-body mb-4">
                            At NEWZONE, we use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                            By clicking "Accept", you consent to our use of cookies. We use the following types of cookies:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-body mb-4">
                            <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
                            <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</li>
                            <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.</li>
                            <li><strong>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">3. Managing Cookies</h2>
                        <p className="text-body mb-4">
                            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
                        </p>
                        <p className="text-body">
                            You can also amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">4. Changes to This Policy</h2>
                        <p className="text-body mb-4">
                            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-(--border-light) text-center">
                    <p className="text-body mb-6">If you have any questions about our use of cookies or other technologies, please contact us.</p>
                    <Link href="/contact" className="btn btn-primary px-8 py-3 rounded-md">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
