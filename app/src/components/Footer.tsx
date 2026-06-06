export function Footer() {
  return (
    <footer className="py-12 border-t-2 border-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-bold text-lg mb-1">Rekrut AI</p>
            <p className="text-sm text-muted-foreground">
              A product of Accelera Pathway Group LLC.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Privacy Policy coming soon.');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Terms of Service coming soon.');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-foreground/20 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Accelera Pathway Group LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
