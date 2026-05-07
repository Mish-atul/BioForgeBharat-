import { useState } from "react";
import {
  useListAnnotations,
  useCreateAnnotation,
  useDeleteAnnotation,
  getListAnnotationsQueryKey,
} from "@workspace/api-client-react";
import type { Annotation, ExperimentWithCandidate } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database, Plus, Search, User, FlaskConical, Trash2 } from "lucide-react";
import { useListExperiments } from "@workspace/api-client-react";

const annotationSchema = z.object({
  experimentId: z.coerce.number().min(1, "Select an experiment"),
  author: z.string().min(1, "Author name is required"),
  content: z.string().min(5, "Annotation must be at least 5 characters"),
});

export default function Annotations() {
  const { data: annotations, isLoading } = useListAnnotations({
    query: { queryKey: getListAnnotationsQueryKey() },
  });
  const { data: experiments } = useListExperiments();
  const createAnnotation = useCreateAnnotation();
  const deleteAnnotation = useDeleteAnnotation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleDelete = (id: number) => {
    if (!confirm("Delete this annotation?")) return;
    deleteAnnotation.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAnnotationsQueryKey() }) }
    );
  };

  const form = useForm<z.infer<typeof annotationSchema>>({
    resolver: zodResolver(annotationSchema),
    defaultValues: { experimentId: 0, author: "", content: "" },
  });

  const onSubmit = (values: z.infer<typeof annotationSchema>) => {
    createAnnotation.mutate(
      { data: values },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAnnotationsQueryKey() });
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  const filtered = annotations?.filter(
    (a: Annotation) =>
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.author.toLowerCase().includes(search.toLowerCase()) ||
      a.candidateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Research Annotations</h1>
          <p className="text-muted-foreground mt-2">Team knowledge base — observations, hypotheses, and insights.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="btn-new-annotation">
              <Plus className="w-4 h-4" />
              Add Annotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-primary">New Annotation</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="experimentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experiment</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded border border-border bg-background text-foreground px-3 py-2 text-sm"
                          data-testid="select-experiment"
                        >
                          <option value={0}>Select an experiment...</option>
                          {experiments?.map((e: ExperimentWithCandidate) => (
                            <option key={e.id} value={e.id}>
                              {e.candidateName} — {e.researcherName}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Priya Sharma" {...field} data-testid="input-author" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annotation</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Key insight, recommendation, or observation..."
                          className="min-h-[120px] resize-none"
                          {...field}
                          data-testid="textarea-annotation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={createAnnotation.isPending} data-testid="btn-submit-annotation">
                    {createAnnotation.isPending ? "Saving..." : "Save Annotation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search annotations..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full bg-card" />)}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <Card className="bg-card border-dashed border-border p-12 text-center">
          <Database className="w-12 h-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium">{search ? "No matching annotations" : "No Annotations Yet"}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            {search ? "Try a different search term." : "Add your first annotation to build the team knowledge base."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((annotation: Annotation) => (
            <Card
              key={annotation.id}
              className="bg-card border-border hover:border-border/80 transition-colors"
              data-testid={`card-annotation-${annotation.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{annotation.author}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <FlaskConical className="w-3 h-3" />
                          {annotation.candidateName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                          {new Date(annotation.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleDelete(annotation.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                          data-testid={`btn-delete-annotation-${annotation.id}`}
                          title="Delete annotation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{annotation.content}</p>
                    <div className="mt-2 text-xs text-muted-foreground font-mono">
                      {annotation.experimentSummary}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
