---
title: A Tiny Waybar Module to Watch My Claude Code Limits
author: Inácio Klassmann
date: 2026-05-30 00:30:00
categories: [linux, omarchy, waybar]
tags: [claude-code, waybar, omarchy, hyprland, python, rate-limit]
pin: true
image:
  path: /assets/img/omarchy-token-consumer.png
---

I run [Omarchy](https://omarchy.org/) on my machine, and like a lot of people
these days I keep [Claude Code](https://www.anthropic.com/claude-code) open all
day. It's great — until you hit a rate limit in the middle of something and only
then remember those limits exist. There's no warning, no gauge, nothing on the
screen. You just suddenly get told to slow down.

I wanted a small number on my status bar that tells me, at a glance, how much of
my budget I've already spent. So I built one. It's called
**[omarchy-token-consumer](https://github.com/codegik/omarchy-token-consumer)**,
and it's a single Python file.

Here's what it looks like in practice:

<video src="/assets/img/omarchy-token-consumer.mp4" controls width="640" style="max-width:100%;border-radius:8px"></video>

## The itch

Claude Code already knows your usage — type `/usage` inside it and you get a
breakdown of your session and weekly limits. So the data is _right there_. The
question was: how do I get that same number onto my Waybar without re-inventing
anything, scraping logs, or managing yet another API key?

My first instinct was the wrong one. I started thinking about pricing tables,
token counting, parsing Claude Code's logs, maybe a little local database to
track usage over time. That's the trap — building a whole accounting system to
answer a question the tool already answers for itself.

## Following the thread

So I stopped and watched what `/usage` actually does. It turns out it just calls
an endpoint:

```
GET https://api.anthropic.com/api/oauth/usage
```

And the authentication? Claude Code already logged in and dropped an OAuth token
on disk at `~/.claude/.credentials.json`. I don't need my own credentials, my
own login flow, or my own anything. I can reuse exactly what Claude Code already
set up:

```python
CREDS = os.path.expanduser("~/.claude/.credentials.json")

def load_token():
    with open(CREDS, encoding="utf-8") as fh:
        oauth = (json.load(fh) or {}).get("claudeAiOauth") or {}
    token = oauth.get("accessToken")
    if not token:
        return None, "no access token in credentials"
    expires_at_ms = oauth.get("expiresAt") or 0
    if expires_at_ms and expires_at_ms / 1000 < datetime.now(timezone.utc).timestamp():
        return None, "token expired — run `claude` to refresh"
    return token, None
```

One deliberate decision here: **I don't refresh the token myself.** If it's
expired, the module just shows a `?` and tells you to run `claude`. Token
refresh is Claude Code's job, and it does it well — duplicating that logic would
only be a way to get it subtly wrong. The module stays a reader, never a writer.

The response comes back with four buckets — `five_hour`, `seven_day`,
`seven_day_opus`, and `seven_day_sonnet` — each with a `utilization` percentage
and a `resets_at` timestamp. The headline number is simply the highest of the
four, because the one closest to its ceiling is the one I actually care about.

## The whole thing fits in your head

Waybar's custom modules speak a tiny JSON dialect: print `{"text": ..., "tooltip":
..., "class": [...]}` to stdout and you're done. So the entire module is: read a
token, make one HTTP call, pick the max percentage, print some JSON. No
dependencies beyond the Python standard library. Nothing to `pip install`.
Nothing to configure.

The output is just this:

```
🤖 5%
```

> In Waybar it's a Nerd Font robot glyph rather than the emoji — it renders
> correctly with any Nerd Font installed.

Hover it and you get the full breakdown — session (5h), weekly, Opus, and Sonnet
— each with its reset time. The number turns **yellow at 80%** and **red at
100%**, so I never have to actually read it until it wants my attention.

## Wiring it into Omarchy

Drop the script on your `PATH`:

```bash
git clone https://github.com/codegik/omarchy-token-consumer.git
cd omarchy-token-consumer
install -m 0755 omarchy-token-consumer ~/.local/bin/
```

Add the module to `~/.config/waybar/config.jsonc` (and reference `"custom/tokens"`
in one of your `modules-*` arrays):

```jsonc
"custom/tokens": {
  "exec": "$HOME/.local/bin/omarchy-token-consumer",
  "return-type": "json",
  "interval": 300,
  "signal": 11,
  "format": "{}",
  "on-click": "xdg-open https://claude.ai/settings/usage"
}
```

A touch of color in `~/.config/waybar/style.css`:

```css
#custom-tokens { margin: 0 7.5px; }
#custom-tokens.warning  { color: #d4a72c; }  /* >= 80% on any limit */
#custom-tokens.critical { color: #a55555; }  /* >= 100%, or no auth  */
```

Then `omarchy restart waybar`. It refreshes every five minutes on its own, and
you can force it anytime with `pkill -RTMIN+11 waybar`.

## The lesson, again

The most satisfying part of this isn't the feature — it's how little code it
took. The first version in my head was a small application. The version that
shipped is barely a script, because I let the existing tools do their jobs: Claude
Code owns auth, Anthropic's API owns the numbers, Waybar owns the rendering. My
job was just to connect three things that were already there.

Good engineering is often subtraction. The code is on GitHub:
[**codegik/omarchy-token-consumer**](https://github.com/codegik/omarchy-token-consumer).
It's a single file — read the whole thing in a couple of minutes.
