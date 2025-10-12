import LoginChat from "@/components/LoginChat";

const ChatPreviewSection = () => {
  console.log('ChatPreviewSection rendering');
  return (
    <section className="mt-0 md:mt-0 -translate-y-0 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-card shadow-xl border border-border p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <LoginChat />
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Welcome to <span className="text-primary">Aliva Chat</span>
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                Ask anything about how you feel, agree on a meal, and say
                <span className="font-medium text-primary"> “find restaurants”</span> to see nearby places instantly. Clean, simple, and built for healthy choices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatPreviewSection;


