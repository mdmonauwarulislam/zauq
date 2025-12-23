// --- New MarqueeBar Component ---
const MarqueeBar = ({ messages }) => {
    // We double the messages to avoid a visual gap before the scroll loops.
    // The CSS animation handles the smooth transition back to the start.
    const allMessages = [...messages, ...messages];
  
    return (
      <div className="bg-brand-primary text-brand-text-primary overflow-hidden py-2 shadow-inner">
        <div className="flex w-fit MarqueeBar_marquee__content">
          {allMessages.map((message, index) => (
            <div
              key={index}
              className="shrink-0 px-8 text-xs font-medium tracking-wide"
            >
              {message}
            </div>
          ))}
        </div>
        {/* This is a common technique to make the content wide enough to scroll off-screen,
          and the keyframe animation (defined in the CSS below) handles the infinite loop. 
        */}
        <style jsx="true">{`
          .MarqueeBar_marquee__content {
            animation: MarqueeBar_marquee__animation 10s linear infinite;
          }
  
          @keyframes MarqueeBar_marquee__animation {
            0% {
              transform: translateX(0);
            }
            100% {
              /* Translate by exactly half of the content (one full set of messages) */
              transform: translateX(-50%);
            }
          }
        `}</style>
      </div>
    );
  };

  export default MarqueeBar;
