"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import type { NewsArticle, EconomicEvent } from "@/types"

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [events, setEvents] = useState<EconomicEvent[]>([])

  useEffect(() => { api.news.list().then(setArticles); api.news.calendar().then(setEvents) }, [])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">News Intelligence</h1><p className="text-muted-foreground">Market news and economic calendar</p></div>
      <Tabs defaultValue="news">
        <TabsList><TabsTrigger value="news">Market News</TabsTrigger><TabsTrigger value="calendar">Economic Calendar</TabsTrigger></TabsList>
        <TabsContent value="news">
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1"><h3 className="font-medium mb-1">{article.title}</h3><p className="text-sm text-muted-foreground mb-2">{article.summary}</p></div>
                    {article.sentiment && <Badge variant={article.sentiment === "bullish" ? "success" : article.sentiment === "bearish" ? "destructive" : "secondary"} className="shrink-0">{article.sentiment}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{article.source}</span><span>{formatDate(article.published_at)}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="calendar">
          <Card><CardContent className="p-4 overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2">Date</th><th className="text-left py-2">Event</th><th className="text-left py-2">Country</th><th className="text-center py-2">Impact</th><th className="text-right py-2">Previous</th><th className="text-right py-2">Forecast</th><th className="text-right py-2">Actual</th></tr></thead>
              <tbody>{events.map((event) => (
                <tr key={event.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="py-2">{formatDate(event.date)}</td><td className="py-2">{event.title}</td><td className="py-2">{event.country}</td>
                  <td className="py-2 text-center"><Badge variant={event.impact === "high" ? "destructive" : event.impact === "medium" ? "warning" : "secondary"}>{event.impact}</Badge></td>
                  <td className="text-right py-2">{event.previous ?? "-"}</td><td className="text-right py-2">{event.forecast ?? "-"}</td><td className="text-right py-2">{event.actual ?? "-"}</td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
