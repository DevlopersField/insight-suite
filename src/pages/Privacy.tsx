import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
    return (
        <div className="min-h-screen bg-background font-sans py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to AuditLens
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">AuditLens</h1>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-bold tracking-tight">Privacy Policy</h2>
                        <p className="text-sm text-muted-foreground">Last updated: February 16, 2026</p>
                    </div>

                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-8 text-foreground">
                        <section className="space-y-4">
                            <p className="leading-relaxed">
                                AuditLens ("we", "our", or "the extension") respects your privacy. This Privacy Policy explains how information is handled when you use the AuditLens Chrome extension.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">1. Information We Collect</h3>
                            <p className="leading-relaxed">
                                AuditLens does not collect, store, transmit, or sell any personal information.
                            </p>
                            <p className="leading-relaxed">
                                The extension operates locally within your browser and analyzes the currently active webpage to provide SEO and audit insights.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">2. Permissions Used</h3>
                            <p className="leading-relaxed">AuditLens may request the following permissions:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Active Tab Permission</strong> – Used to analyze the content of the webpage you are currently viewing.</li>
                                <li><strong>Storage Permission</strong> – Used to store user preferences locally within your browser.</li>
                            </ul>
                            <p className="leading-relaxed">No browsing history is stored externally.</p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">3. Data Processing</h3>
                            <p className="leading-relaxed">
                                All website analysis is performed locally within the user's browser. We do not transmit webpage content to external servers.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">4. Third-Party Services</h3>
                            <p className="leading-relaxed">
                                AuditLens does not use third-party analytics, tracking tools, or advertising services.
                            </p>
                            <p className="leading-relaxed">
                                If future updates introduce third-party integrations, this policy will be updated accordingly.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">5. Data Sharing</h3>
                            <p className="leading-relaxed">
                                We do not sell, trade, or share any user data with third parties.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">6. Children's Privacy</h3>
                            <p className="leading-relaxed">
                                AuditLens does not knowingly collect personal information from children under 13 years of age.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">7. Changes to This Policy</h3>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy from time to time. Updates will be posted on this page with a revised "Last updated" date.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">8. Contact Information</h3>
                            <p className="leading-relaxed">
                                If you have any questions regarding this Privacy Policy, you may contact us at:
                            </p>
                            <div className="bg-muted p-4 rounded-lg space-y-1">
                                <p><strong>Email:</strong> <a href="mailto:virajdev3052003@gmail.com" className="text-primary hover:underline">virajdev3052003@gmail.com</a></p>
                                <p><strong>Website:</strong> <a href="https://webauditlens.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://webauditlens.netlify.app/</a></p>
                            </div>
                        </section>
                    </div>
                </div>

                <footer className="pt-12 border-t text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} AuditLens. All rights reserved.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Privacy;
