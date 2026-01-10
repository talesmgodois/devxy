import { ReactNode } from 'react';
import { SPONSORS, SUPPORT_LINKS, hasSponsors, getMainSponsor } from '@/config/sponsors';
import { Heart } from 'lucide-react';

interface AdWrapperProps {
  children: ReactNode;
  showTopBanner?: boolean;
  showSideAds?: boolean;
}

/**
 * AdWrapper component for displaying sponsor content and ad zones.
 * 
 * Usage:
 * - showTopBanner: Display a top banner with sponsor/support message
 * - showSideAds: Display side column ad zones (for larger screens)
 * 
 * Ad zone sizes:
 * - Top banner: 728x90 (leaderboard)
 * - Side columns: 160x600 (skyscraper)
 */
export function AdWrapper({ 
  children, 
  showTopBanner = false, 
  showSideAds = false 
}: AdWrapperProps) {
  const mainSponsor = getMainSponsor();
  const primarySupport = SUPPORT_LINKS[0];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Banner Ad Zone */}
      {showTopBanner && (
        <div className="flex-shrink-0 bg-card/50 border-b border-border/30">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
            {hasSponsors() && mainSponsor ? (
              <>
                <span className="text-muted-foreground">Sponsored by</span>
                <a
                  href={mainSponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {mainSponsor.name}
                </a>
                {mainSponsor.message && (
                  <span className="text-muted-foreground hidden sm:inline">
                    — {mainSponsor.message}
                  </span>
                )}
              </>
            ) : primarySupport ? (
              <>
                <Heart className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">Love Devxy?</span>
                <a
                  href={primarySupport.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Support the project
                </a>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Main Content with Optional Side Ads */}
      <div className="flex-1 flex">
        {/* Left Ad Zone */}
        {showSideAds && (
          <aside className="hidden xl:flex flex-col items-center justify-start pt-8 w-[180px] flex-shrink-0">
            <div 
              className="sticky top-8 w-[160px] h-[600px] bg-card/30 border border-border/20 rounded flex items-center justify-center text-muted-foreground/50 text-xs"
              data-ad-slot="left-skyscraper"
            >
              {/* Replace with actual ad code */}
              <span className="rotate-90 whitespace-nowrap">Ad Space 160x600</span>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Right Ad Zone */}
        {showSideAds && (
          <aside className="hidden xl:flex flex-col items-center justify-start pt-8 w-[180px] flex-shrink-0">
            <div 
              className="sticky top-8 w-[160px] h-[600px] bg-card/30 border border-border/20 rounded flex items-center justify-center text-muted-foreground/50 text-xs"
              data-ad-slot="right-skyscraper"
            >
              {/* Replace with actual ad code */}
              <span className="rotate-90 whitespace-nowrap">Ad Space 160x600</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/**
 * Simple sponsor badge component for use in footer or header
 */
export function SponsorBadge({ className = '' }: { className?: string }) {
  const mainSponsor = getMainSponsor();
  const primarySupport = SUPPORT_LINKS[0];

  if (hasSponsors() && mainSponsor) {
    return (
      <a
        href={mainSponsor.website}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
        title={`Sponsored by ${mainSponsor.name}`}
      >
        <Heart className="w-3 h-3 text-destructive" />
        <span>{mainSponsor.name}</span>
      </a>
    );
  }

  if (primarySupport) {
    return (
      <a
        href={primarySupport.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
        title="Support Devxy"
      >
        <Heart className="w-3 h-3 text-destructive" />
        <span>Sponsor</span>
      </a>
    );
  }

  return null;
}
