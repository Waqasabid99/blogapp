"use client";

import React from 'react';
import Link from 'next/link';

const TermsConditions = () => {
    const lastUpdated = "March 24, 2026";

    return (
        <div className="bg-(--bg-primary) min-h-screen py-16 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto bg-(--bg-secondary) p-8 md:p-16 rounded-lg border border-(--border-light) shadow-(--shadow-sm)">
                <div className="mb-12 border-b border-(--border-light) pb-8">
                    <h1 className="heading-1 mb-4 text-(--text-primary)">Terms and Conditions</h1>
                    <p className="text-(--text-secondary) text-sm">Last Updated: {lastUpdated}</p>
                </div>

                <div className="space-y-10 text-(--text-primary)">
                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">1. Introduction</h2>
                        <p className="text-body mb-4">
                            Welcome to NEWZONE. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before using our platform.
                        </p>
                        <p className="text-body">
                            If you do not agree with any part of these terms, you must not use our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">2. Intellectual Property Rights</h2>
                        <p className="text-body mb-4">
                            Other than the content you own, under these terms, NEWZONE and/or its licensors own all the intellectual property rights and materials contained in this website.
                            You are granted a limited license only for purposes of viewing the material contained on this website.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">3. User Content</h2>
                        <p className="text-body mb-4">
                            In these terms and conditions, "User Content" shall mean any audio, video text, images or other material you choose to display on this website. By displaying Your Content, you grant NEWZONE a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
                        </p>
                        <p className="text-body">
                            Your Content must be your own and must not be invading any third-party's rights. NEWZONE reserves the right to remove any of Your Content from this website at any time without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">4. Restrictions</h2>
                        <p className="text-body mb-4">You are specifically restricted from all of the following:</p>
                        <ul className="list-disc pl-6 space-y-2 text-body">
                            <li>Publishing any website material in any other media without prior consent.</li>
                            <li>Selling, sublicensing and/or otherwise commercializing any website material.</li>
                            <li>Using this website in any way that is or may be damaging to this website.</li>
                            <li>Using this website in any way that impacts user access to this website.</li>
                            <li>Engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this website.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">5. No Warranties</h2>
                        <p className="text-body mb-4">
                            This website is provided "as is," with all faults, and NEWZONE expresses no representations or warranties, of any kind related to this website or the materials contained on this website.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">6. Limitation of Liability</h2>
                        <p className="text-body mb-4">
                            In no event shall NEWZONE, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">7. Changes to Terms</h2>
                        <p className="text-body mb-4">
                            NEWZONE is permitted to revise these terms at any time as it sees fit, and by using this website you are expected to review these terms on a regular basis.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-(--border-light) text-center">
                    <p className="text-body mb-6">If you have any questions about these Terms, please contact us.</p>
                    <Link href="/contact" className="btn btn-primary px-8 py-3 rounded-md">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
