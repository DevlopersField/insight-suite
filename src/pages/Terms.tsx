import { Shield, ArrowLeft, FileText, Scale, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
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
                        <h2 className="text-4xl font-bold tracking-tight">Terms of Service</h2>
                        <p className="text-sm text-muted-foreground">Last updated: February 16, 2026</p>
                    </div>

                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-8 text-foreground">
                        <section className="space-y-4">
                            <p className="leading-relaxed">
                                By using the AuditLens Chrome extension ("the Service"), you agree to comply with and be bound by the following terms and conditions.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                                <Scale className="w-5 h-5 text-primary" />
                                1. Acceptance of Terms
                            </h3>
                            <p className="leading-relaxed">
                                By accessing and using AuditLens, you accept and agree to be bound by the terms and provisions of this agreement.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                2. Description of Service
                            </h3>
                            <p className="leading-relaxed">
                                AuditLens provides SEO auditing, technology detection, and security header analysis tools. The service is provided "as is" and we reserve the right to modify or discontinue the service with or without notice.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                3. User Responsibilities
                            </h3>
                            <p className="leading-relaxed">
                                Users are responsible for ensuring that their use of the extension complies with local laws and the terms of service of the websites they analyze. AuditLens should not be used for malicious purposes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">4. Intellectual Property</h3>
                            <p className="leading-relaxed">
                                All code, design, and branding associated with AuditLens are the property of the extension developers. Users may not modify, distribute, or reverse engineer the software.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">5. Limitation of Liability</h3>
                            <p className="leading-relaxed">
                                AuditLens shall not be liable for any indirect, incidental, special, consequential, or exemplary damages resulting from the use or inability to use the service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">6. Contact</h3>
                            <p className="leading-relaxed">
                                For questions regarding these terms, please contact us at: <a href="mailto:virajdev3052003@gmail.com" className="text-primary hover:underline font-medium">virajdev3052003@gmail.com</a>.
                            </p>
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

export default Terms;
