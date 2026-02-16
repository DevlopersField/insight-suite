import { Shield, ArrowLeft, Mail, Globe, MessageSquare, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
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

                <div className="space-y-8">
                    <div className="space-y-4 text-center">
                        <h2 className="text-4xl font-bold tracking-tight">How can we help?</h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Have questions about AuditLens or need technical assistance? Our team is here to support you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/30 transition-all shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Email Support</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    For general inquiries and bug reports, reach out via email.
                                </p>
                            </div>
                            <a
                                href="mailto:virajdev3052003@gmail.com"
                                className="inline-block text-primary font-bold hover:underline"
                            >
                                virajdev3052003@gmail.com
                            </a>
                        </div>

                        <div className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/30 transition-all shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Website</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Visit our official website for documentation and updates.
                                </p>
                            </div>
                            <a
                                href="https://webauditlens.netlify.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-primary font-bold hover:underline"
                            >
                                webauditlens.netlify.app
                            </a>
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-muted/50 border border-border space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Response Time</h3>
                                <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Feedback</h3>
                                <p className="text-sm text-muted-foreground">Love the tool? Please leave a review on the Chrome Web Store.</p>
                            </div>
                        </div>
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

export default Support;
