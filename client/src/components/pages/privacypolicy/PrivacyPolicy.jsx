"use client";

import React from 'react';
import Link from 'next/link';

const PrivacyPolicy = () => {
    const lastUpdated = "March 24, 2026";

    return (
        <div className="bg-(--bg-primary) min-h-screen py-16 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto bg-(--bg-secondary) p-8 md:p-16 rounded-lg border border-(--border-light) shadow-(--shadow-sm)">
                <div className="mb-12 border-b border-(--border-light) pb-8">
                    <h1 className="heading-1 mb-4 text-(--text-primary)">Privacy Policy</h1>
                    <p className="text-(--text-secondary) text-sm">Last Updated: {lastUpdated}</p>
                </div>

                <div className="space-y-10 text-(--text-primary)">
                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">1. Introduction</h2>
                        <p className="text-body mb-4">
                            At NEWZONE, we are committed to protecting your personal information and your right to privacy.
                            If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                        </p>
                        <p className="text-body">
                            When you visit our website and use our services, you trust us with your personal information. We take your privacy very seriously.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">2. Information We Collect</h2>
                        <p className="text-body mb-4">
                            We collect personal information that you voluntarily provide to us when registering at the website, expressing an interest in obtaining information about us or our products and services, when participating in activities on the website or otherwise contacting us.
                        </p>
                        <p className="text-body mb-2">The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use. The personal information we collect can include the following:</p>
                        <ul className="list-disc pl-6 space-y-2 text-body">
                            <li>Name and Contact Data (Email address, phone number).</li>
                            <li>Credentials (Passwords, password hints, and similar security information used for authentication and account access).</li>
                            <li>Profile data (such as profile picture or social media links provided voluntarily).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">3. How We Use Your Information</h2>
                        <p className="text-body mb-4">
                            We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-body">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send you marketing and promotional communications.</li>
                            <li>To send administrative information to you.</li>
                            <li>To deliver targeted advertising to you.</li>
                            <li>To request feedback and contact you about your use of our website.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">4. Will Your Information Be Shared With Anyone?</h2>
                        <p className="text-body mb-4">
                            We only share and disclose your information in the following situations:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-body">
                            <li><strong>Compliance with Laws:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                            <li><strong>Vital Interests and Legal Rights:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation in which we are involved.</li>
                            <li><strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">5. Do We Use Cookies and Other Tracking Technologies?</h2>
                        <p className="text-body mb-4">
                            We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">6. How Long Do We Keep Your Information?</h2>
                        <p className="text-body mb-4">
                            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting or other legal requirements).
                        </p>
                    </section>

                    <section>
                        <h2 className="heading-2 mb-4 text-(--text-primary)">7. How Do We Keep Your Information Safe?</h2>
                        <p className="text-body mb-4">
                            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                        </p>
                    </section>

                </div>

                <div className="mt-16 pt-8 border-t border-(--border-light) text-center">
                    <p className="text-body mb-6">If you have any questions or comments about this policy, you may email us.</p>
                    <Link href="/contact" className="btn btn-primary px-8 py-3 rounded-md">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
