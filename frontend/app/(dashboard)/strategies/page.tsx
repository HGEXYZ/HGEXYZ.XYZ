"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { Code2, Image as ImageIcon, Loader2 } from "lucide-react"

export default function StrategiesPage() {
  const [description, setDescription] = useState("")
  const [language, setLanguage] = useState("pine_script")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try { const res = await api.strategies.generate({ description, target_language: language }); setResult(res) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Strategy Builder</h1><p className="text-muted-foreground">Generate trading strategies from natural language</p></div>
      <Tabs defaultValue="generate">
        <TabsList><TabsTrigger value="generate">Generate Strategy</TabsTrigger><TabsTrigger value="analyze">Chart Analysis</TabsTrigger></TabsList>
        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Describe Your Strategy</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your trading strategy in natural language...&#10;&#10;Example: Buy when the 20-day SMA crosses above the 50-day SMA and RSI is below 40. Sell when RSI exceeds 70 or the 20-day SMA crosses below the 50-day SMA." className="w-full h-40 px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none" />
                <Select value={language} onChange={(e) => setLanguage(e.target.value)} label="Target Language" options={[{ value: "pine_script", label: "Pine Script (TradingView)" }, { value: "python", label: "Python" }, { value: "mt5", label: "MT5 EA (MQL5)" }]} />
                <Button onClick={generate} disabled={loading || !description} className="w-full"><Code2 className="h-4 w-4 mr-2" />{loading ? "Generating..." : "Generate Strategy"}</Button>
              </CardContent>
            </Card>
            {result && (
              <Card><CardHeader><CardTitle>Generated Code</CardTitle></CardHeader>
                <CardContent className="space-y-4"><pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-xs"><code>{result.code}</code></pre></CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="analyze">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Upload Chart Screenshot</CardTitle></CardHeader>
              <CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Upload a trading chart screenshot for AI analysis. The AI will detect patterns, support/resistance levels, and score the setup.</p>
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50"><ImageIcon className="h-8 w-8 text-muted-foreground mb-2" /><span className="text-sm text-muted-foreground">Click to upload chart image</span><input type="file" className="hidden" accept="image/*" /></label>
                <Button disabled className="w-full"><Loader2 className="h-4 w-4 mr-2" />Analyze Chart</Button>
              </CardContent>
            </Card>
            {analysisResult && <Card><CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader><CardContent><pre className="text-sm whitespace-pre-wrap">{analysisResult.analysis}</pre></CardContent></Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
