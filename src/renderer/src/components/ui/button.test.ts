import { describe, expect, it } from 'vitest'
import { buttonVariants } from './button'

describe('buttonVariants', () => {
  it('keeps filled buttons crisp enough for primary app actions', () => {
    const className = buttonVariants({ variant: 'default' })

    expect(className).toContain('border')
    expect(className).toContain('border-transparent')
    expect(className).toContain('shadow-xs')
  })

  it('uses restrained workbench chrome for secondary and outline actions', () => {
    const secondary = buttonVariants({ variant: 'secondary' })
    const outline = buttonVariants({ variant: 'outline' })

    expect(secondary).toContain('border-border/70')
    expect(secondary).toContain('bg-secondary/80')
    expect(outline).toContain('bg-background/70')
    expect(outline).toContain('data-[state=open]:bg-accent')
  })

  it('keeps ghost buttons quiet until hover or open state', () => {
    const className = buttonVariants({ variant: 'ghost' })

    expect(className).toContain('text-muted-foreground')
    expect(className).toContain('border-transparent')
    expect(className).toContain('data-[state=open]:bg-accent')
    expect(className).toContain('data-[state=open]:text-accent-foreground')
  })

  it('preserves documented app button heights', () => {
    expect(buttonVariants({ size: 'default' })).toContain('h-9')
    expect(buttonVariants({ size: 'sm' })).toContain('h-8')
    expect(buttonVariants({ size: 'xs' })).toContain('h-6')
    expect(buttonVariants({ size: 'icon-sm' })).toContain('size-8')
  })
})
