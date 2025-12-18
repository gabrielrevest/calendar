'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Palette, Save } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const presetThemes = [
  { name: 'Par défaut', colors: { primary: '#3B82F6', secondary: '#8B5CF6' } },
  { name: 'Ocean', colors: { primary: '#06B6D4', secondary: '#0891B2' } },
  { name: 'Forest', colors: { primary: '#22C55E', secondary: '#16A34A' } },
  { name: 'Sunset', colors: { primary: '#F97316', secondary: '#EA580C' } },
  { name: 'Purple', colors: { primary: '#8B5CF6', secondary: '#7C3AED' } },
  { name: 'Pink', colors: { primary: '#EC4899', secondary: '#DB2777' } },
]

export function ThemeCustomizer() {
  const [customTheme, setCustomTheme] = useState({ primary: '#3B82F6', secondary: '#8B5CF6' })
  const { toast } = useToast()

  const applyTheme = (theme: typeof presetThemes[0]) => {
    document.documentElement.style.setProperty('--primary', theme.colors.primary)
    document.documentElement.style.setProperty('--secondary', theme.colors.secondary)
    toast({ title: `Thème "${theme.name}" appliqué` })
  }

  const saveCustomTheme = () => {
    document.documentElement.style.setProperty('--primary', customTheme.primary)
    document.documentElement.style.setProperty('--secondary', customTheme.secondary)
    toast({ title: 'Thème personnalisé sauvegardé' })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Thèmes prédéfinis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {presetThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => applyTheme(theme)}
                className="p-4 border rounded-lg hover:border-primary transition-colors text-left"
              >
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                </div>
                <div className="font-medium">{theme.name}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thème personnalisé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Couleur principale</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={customTheme.primary}
                onChange={(e) => setCustomTheme({ ...customTheme, primary: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={customTheme.primary}
                onChange={(e) => setCustomTheme({ ...customTheme, primary: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div>
            <Label>Couleur secondaire</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={customTheme.secondary}
                onChange={(e) => setCustomTheme({ ...customTheme, secondary: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={customTheme.secondary}
                onChange={(e) => setCustomTheme({ ...customTheme, secondary: e.target.value })}
                placeholder="#8B5CF6"
              />
            </div>
          </div>
          <Button onClick={saveCustomTheme} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder le thème personnalisé
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

