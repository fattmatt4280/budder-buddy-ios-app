import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EDUCATION_CATEGORIES, searchArticles } from '@/data/educationContent';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot.png';

export default function LearnScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.length > 1 ? searchArticles(searchQuery) : null;

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header with mascot */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={mascotImage} 
            alt="Budder Buddy" 
            className="w-12 h-12 rounded-xl shadow-md"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Learn</h1>
            <p className="text-muted-foreground text-sm">
              Everything about tattoo healing
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border rounded-xl"
          />
        </div>
      </div>

      {/* Search results */}
      {searchResults ? (
        <div className="px-6 pb-8">
          <p className="text-sm text-muted-foreground mb-4">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
          <div className="space-y-2">
            {searchResults.map((article) => (
              <button
                key={article.id}
                onClick={() => navigate(`/learn/${article.id}`)}
                className="w-full bg-card rounded-xl p-4 border border-border text-left hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium text-foreground mb-1">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Categories */
        <div className="px-6 pb-8 space-y-4">
          {EDUCATION_CATEGORIES.map((category, index) => (
            <div 
              key={category.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg",
                  category.id === 'aftercare-guide' && "bg-primary/10",
                  category.id === 'whats-normal' && "bg-success/10",
                  category.id === 'common-mistakes' && "bg-warning/10",
                  category.id === 'itch-peeling' && "bg-accent/20",
                  category.id === 'contact-artist' && "bg-info/10",
                  category.id === 'seek-medical' && "bg-destructive/10",
                )}>
                  {category.icon}
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground">{category.title}</h2>
                  {category.id === 'aftercare-guide' && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Articles */}
              <div className="space-y-2 pl-1">
                {category.articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => {
                      if (article.externalUrl) {
                        window.open(article.externalUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        navigate(`/learn/${article.id}`);
                      }
                    }}
                    className={cn(
                      "w-full rounded-xl p-4 border text-left transition-colors group",
                      article.externalUrl 
                        ? "bg-primary/5 border-primary/20 hover:border-primary/40" 
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-0.5">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{article.summary}</p>
                      </div>
                      {article.externalUrl ? (
                        <ExternalLink className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors shrink-0 ml-2" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
