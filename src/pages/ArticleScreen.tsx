import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { getArticle, EDUCATION_CATEGORIES } from '@/data/educationContent';

export default function ArticleScreen() {
  const navigate = useNavigate();
  const { articleId } = useParams();

  // Scroll to top when article loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleId]);

  const article = articleId ? getArticle(articleId) : undefined;
  const category = article
    ? EDUCATION_CATEGORIES.find((c) => c.id === article.categoryId)
    : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background safe-area-top flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-muted-foreground mb-4">Article not found</p>
          <button
            onClick={() => navigate('/learn')}
            className="text-primary font-medium"
          >
            Back to Learn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/learn')}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          {category && (
            <span className="text-sm text-muted-foreground">{category.title}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground mb-2">{article.title}</h1>
        <p className="text-muted-foreground mb-6">{article.summary}</p>

        <div className="space-y-4">
          {article.content.map((paragraph, index) => (
            <p key={index} className="text-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Escalation note */}
        {article.escalationNote && (
          <div className="mt-8 p-4 bg-warning/10 border border-warning/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Important</p>
                <p className="text-sm text-muted-foreground">{article.escalationNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer disclaimer */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This information is for educational purposes only and does not constitute medical advice.
            If you have concerns about your tattoo, contact your tattoo artist or a medical professional.
          </p>
        </div>
      </div>
    </div>
  );
}
