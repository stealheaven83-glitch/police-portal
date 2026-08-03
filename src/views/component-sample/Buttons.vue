<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  ChevronRight,
  Mail,
  Loader2,
  Plus,
  Trash2,
  Download,
  Settings,
  Send
} from 'lucide-vue-next'
</script>

<template>
  <div class="p-6">
    <div class="container p-6 bg-white rounded-lg h-[calc(100vh-200px)] flex flex-col">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Buttons</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Shadcn UI와 Tailwind CSS를 활용한 다양한 버튼 컴포넌트 샘플입니다.
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto pr-2 space-y-8 animate-in fade-in duration-500 scrollbar-hide">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Variants</h2>
          <div class="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div class="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="tertiary">tertiary</Button>
            <Button variant="tertiary2">tertiary2</Button>
            <Button variant="text">tertiary2</Button>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Sizes</h2>
          <div class="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="xxs">xxs</Button>
            <Button variant="primary" size="xs">xs</Button>
            <Button variant="primary" size="sm">sm</Button>
            <Button variant="primary" size="md">md</Button>
            <Button variant="primary" size="lg">lg</Button>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">With Icons</h2>
          <div class="flex flex-wrap gap-4">
            <Button>
              <Mail class="mr-2 h-4 w-4" /> Login with Email
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight class="h-4 w-4" />
            </Button>
            <Button variant="secondary">
              <Settings class="mr-2 h-4 w-4" /> Settings
            </Button>
            <Button variant="destructive">
              <Trash2 class="mr-2 h-4 w-4" /> Delete
            </Button>
            <Button>
              <Send class="mr-2 h-4 w-4" /> Send Message
            </Button>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">States</h2>
          <div class="flex flex-wrap gap-4">
            <Button disabled>
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
            <Button>
              <Plus class="mr-2 h-4 w-4" /> New Item
            </Button>
            <Button variant="secondary">
              <Download class="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold border-b pb-2">Icon Buttons (Square)</h2>
          <div class="flex flex-wrap gap-4">
            <Button variant="outline" size="icon">
              <Plus class="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <Settings class="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon">
              <Trash2 class="h-4 w-4" />
            </Button>
            <Button size="icon-sm">
              <Plus class="h-3 w-3" />
            </Button>
            <Button size="icon-lg">
              <Plus class="h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
