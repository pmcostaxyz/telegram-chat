import { Send } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card shadow-elegant">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <Send className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Telegram Automator</h1>
            <p className="text-sm text-muted-foreground">Schedule and automate your messages</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
