'use client';

import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo */}
        <div className="text-xl font-bold text-foreground">
          Learn<span className="text-primary">Hub</span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-muted text-center md:text-left">
          © {new Date().getFullYear()} LearnHub Inc. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="text-muted hover:text-primary transition-colors text-sm"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-muted hover:text-primary transition-colors text-sm"
          >
            Terms
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            className="text-muted hover:text-primary transition-colors text-sm"
          >
            Twitter
          </Link>
        </div>
      </div>
    </footer>
  );
}
