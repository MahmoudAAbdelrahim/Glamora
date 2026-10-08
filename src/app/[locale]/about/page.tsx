"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Award,
  Beaker,
  Check,
  Heart,
  Leaf,
  Microscope,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";

import {
  BASE_CSS,
  type Locale,
} from "../../../lib/sharedids";

type AboutPageProps = {
  params?: {
    locale?: string;
  };
};

const IMAGES = {
  hero:
    "https://luxflacon.com/_next/image?q=75&url=%2F_next%2Fstatic%2Fmedia%2Fhome-category-solutions.0mc9qp0x2utet.png&w=3840",

  beauty:
    "https://media.bergdorfgoodman.com/f_auto%2Cq_auto%3Alow%2Car_5%3A7%2Cc_fill%2Cdpr_2.0%2Cw_720/01/bg_4255849_100000_c",

  ritual:
    "https://www.dior.com/dw/image/v2/BGXS_PRD/on/demandware.static/-/Library-Sites-DiorSharedLibrary/default/dwdb5ff8b5/images/beauty/03-SKINCARE/2025/PDP-REVAMP/LORDEVIE/Y0998024/ODV_Yunsu_EyeCream_2250x3000.jpg?sw=800",

  laboratory:
    "https://www.realself.com/news/wp-content/uploads/2021/06/RS_Derm-Tested-vs-Derm-Recommended.jpg",

  collection:
    "https://coalharbourpharmacy.com/cdn/shop/collections/Beauty_Skin_Care.png?v=1780071182&width=2048",

  dark:
    "https://www.hermedior.com/gallery1.png",
};

const ABOUT_CSS = `
  .ga-page {
    --ga-wine: #8b1538;
    --ga-wine-deep: #6d0f2b;
    --ga-pink: #f4b6c2;
    --ga-blush: #fbe4e8;
    --ga-rose: #d6506f;
    --ga-navy: #17213c;
    --ga-text: #263047;
    --ga-muted: #7c8495;
    --ga-line: #eadde1;
    --ga-soft: #fff8fa;

    min-height: 100vh;
    overflow: hidden;
    background: #fff;
    color: var(--ga-text);
  }

  .ga-page *,
  .ga-page *::before,
  .ga-page *::after {
    box-sizing: border-box;
  }

  /* =====================================================
     REVEAL
  ===================================================== */

  .ga-reveal {
    opacity: 0;
    transform: translateY(45px);
    transition:
      opacity .8s cubic-bezier(.22,1,.36,1),
      transform .8s cubic-bezier(.22,1,.36,1);
  }

  .ga-reveal.ga-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .ga-delay-1 { transition-delay: .08s; }
  .ga-delay-2 { transition-delay: .16s; }
  .ga-delay-3 { transition-delay: .24s; }
  .ga-delay-4 { transition-delay: .32s; }

  /* =====================================================
     HERO
  ===================================================== */

  .ga-hero {
    position: relative;
    min-height: min(820px, 92vh);
    display: flex;
    align-items: center;
    isolation: isolate;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 75% 35%,
        rgba(244,182,194,.38),
        transparent 32%
      ),
      #fff;
  }

  .ga-hero::before {
    content: "";
    position: absolute;
    width: 620px;
    height: 620px;
    right: -230px;
    top: -220px;
    border-radius: 50%;
    background: rgba(139,21,56,.055);
    filter: blur(2px);
    z-index: -2;
  }

  .ga-hero-grid {
    width: min(1320px, calc(100% - 70px));
    margin: 0 auto;
    display: grid;
    grid-template-columns: .9fr 1.1fr;
    gap: 70px;
    align-items: center;
  }

  .ga-hero-copy {
    position: relative;
    z-index: 4;
  }

  .ga-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 22px;
    color: var(--ga-wine);
    font-size: 12px;
    font-weight: 950;
    letter-spacing: 2.5px;
    text-transform: uppercase;
  }

  .ga-eyebrow-line {
    width: 35px;
    height: 1px;
    background: var(--ga-wine);
  }

  .ga-hero-title {
    max-width: 690px;
    margin: 0;
    color: var(--ga-navy);
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(48px, 6.5vw, 92px);
    line-height: .98;
    font-weight: 500;
    letter-spacing: -3px;
  }

  .ga-hero-title em {
    color: var(--ga-wine);
    font-style: italic;
  }

  .ga-hero-text {
    max-width: 570px;
    margin: 27px 0 0;
    color: var(--ga-muted);
    font-size: 16px;
    line-height: 1.95;
  }

  .ga-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 13px;
    margin-top: 34px;
  }

  .ga-primary-btn {
    min-height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 22px;
    border-radius: 14px;
    background: linear-gradient(
      135deg,
      var(--ga-wine),
      var(--ga-wine-deep)
    );
    color: #fff !important;
    text-decoration: none;
    font-size: 14px;
    font-weight: 900;
    box-shadow: 0 15px 35px rgba(139,21,56,.20);
    transition:
      transform .25s ease,
      box-shadow .25s ease;
  }

  .ga-primary-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(139,21,56,.27);
  }

  .ga-primary-btn *,
  .ga-secondary-btn * {
    color: inherit !important;
  }

  .ga-secondary-btn {
    min-height: 50px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 21px;
    border: 1px solid var(--ga-line);
    border-radius: 14px;
    background: #fff;
    color: var(--ga-navy) !important;
    text-decoration: none;
    font-size: 14px;
    font-weight: 850;
    transition:
      border-color .25s ease,
      transform .25s ease,
      background .25s ease;
  }

  .ga-secondary-btn:hover {
    border-color: var(--ga-pink);
    background: var(--ga-soft);
    transform: translateY(-3px);
  }

  .ga-hero-visual {
    position: relative;
    height: 650px;
  }

  .ga-hero-image-frame {
    position: absolute;
    inset: 15px 20px 15px 30px;
    overflow: hidden;
    border-radius: 220px 220px 25px 25px;
    box-shadow: 0 35px 90px rgba(75,22,38,.18);
    transform: rotate(2deg);
  }

  .ga-hero-image-frame img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 1.3s cubic-bezier(.22,1,.36,1);
  }

  .ga-hero:hover .ga-hero-image-frame img {
    transform: scale(1.045);
  }

  .ga-hero-image-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        135deg,
        rgba(109,15,43,.04),
        rgba(139,21,56,.25)
      );
    pointer-events: none;
  }

  .ga-floating-card {
    position: absolute;
    left: -8px;
    bottom: 60px;
    z-index: 5;
    width: 210px;
    padding: 19px;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 20px;
    background: rgba(255,255,255,.88);
    backdrop-filter: blur(18px);
    box-shadow: 0 22px 55px rgba(75,22,38,.14);
    animation: ga-float 4.5s ease-in-out infinite;
  }

  .ga-floating-card small {
    display: block;
    margin-bottom: 6px;
    color: var(--ga-muted);
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  .ga-floating-card strong {
    display: block;
    color: var(--ga-navy);
    font-family: Georgia, serif;
    font-size: 22px;
    font-weight: 500;
  }

  .ga-floating-card span {
    display: block;
    margin-top: 4px;
    color: var(--ga-wine);
    font-size: 11px;
    font-weight: 800;
  }

  .ga-orbit {
    position: absolute;
    right: -5px;
    top: 70px;
    width: 100px;
    height: 100px;
    border: 1px solid rgba(139,21,56,.18);
    border-radius: 50%;
    animation: ga-spin 15s linear infinite;
  }

  .ga-orbit::after {
    content: "";
    position: absolute;
    width: 9px;
    height: 9px;
    right: 7px;
    top: 15px;
    border-radius: 50%;
    background: var(--ga-wine);
    box-shadow: 0 0 0 7px rgba(139,21,56,.08);
  }

  .ga-scroll {
    position: absolute;
    left: 50%;
    bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    transform: translateX(-50%);
    color: var(--ga-muted);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .ga-scroll svg {
    animation: ga-bounce 1.7s ease-in-out infinite;
  }

  @keyframes ga-float {
    0%,100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-13px) rotate(1deg); }
  }

  @keyframes ga-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes ga-bounce {
    0%,100% { transform: translateY(0); }
    50% { transform: translateY(7px); }
  }

  /* =====================================================
     MARQUEE
  ===================================================== */

  .ga-marquee {
    overflow: hidden;
    border-top: 1px solid var(--ga-line);
    border-bottom: 1px solid var(--ga-line);
    background: var(--ga-wine);
    color: #fff;
  }

  .ga-marquee-track {
    width: max-content;
    display: flex;
    align-items: center;
    gap: 38px;
    padding: 14px 0;
    animation: ga-marquee 25s linear infinite;
  }

  .ga-marquee-item {
    display: flex;
    align-items: center;
    gap: 38px;
    white-space: nowrap;
    font-family: Georgia, serif;
    font-size: 15px;
    letter-spacing: .8px;
  }

  .ga-marquee-dot {
    color: var(--ga-pink);
  }

  @keyframes ga-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* =====================================================
     INTRO
  ===================================================== */

  .ga-section {
    width: min(1240px, calc(100% - 50px));
    margin: 0 auto;
    padding: 125px 0;
  }

  .ga-intro {
    display: grid;
    grid-template-columns: .75fr 1.25fr;
    gap: 90px;
    align-items: center;
  }

  .ga-section-label {
    color: var(--ga-wine);
    font-size: 11px;
    font-weight: 950;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .ga-section-title {
    margin: 15px 0 0;
    color: var(--ga-navy);
    font-family: Georgia, serif;
    font-size: clamp(36px, 5vw, 64px);
    line-height: 1.05;
    font-weight: 500;
    letter-spacing: -2px;
  }

  .ga-section-title em {
    color: var(--ga-wine);
    font-style: italic;
  }

  .ga-intro-copy p {
    margin: 0 0 18px;
    color: var(--ga-muted);
    font-size: 15px;
    line-height: 2;
  }

  .ga-intro-copy p:first-child {
    color: var(--ga-navy);
    font-size: 19px;
    line-height: 1.8;
    font-weight: 650;
  }

  /* =====================================================
     STATS
  ===================================================== */

  .ga-stats {
    border-top: 1px solid var(--ga-line);
    border-bottom: 1px solid var(--ga-line);
  }

  .ga-stats-grid {
    width: min(1240px, calc(100% - 50px));
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .ga-stat {
    position: relative;
    padding: 48px 25px;
    text-align: center;
  }

  .ga-stat + .ga-stat::before {
    content: "";
    position: absolute;
    left: 0;
    top: 25%;
    width: 1px;
    height: 50%;
    background: var(--ga-line);
  }

  .ga-stat-number {
    color: var(--ga-wine);
    font-family: Georgia, serif;
    font-size: clamp(38px, 5vw, 60px);
    line-height: 1;
    font-weight: 500;
  }

  .ga-stat-label {
    margin-top: 9px;
    color: var(--ga-muted);
    font-size: 12px;
    font-weight: 800;
  }

  /* =====================================================
     SPLIT STORY
  ===================================================== */

  .ga-story {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 75px;
    align-items: center;
  }

  .ga-story.reverse .ga-story-image {
    order: 2;
  }

  .ga-story-image {
    position: relative;
    min-height: 600px;
    overflow: visible;
  }

  .ga-story-image-main {
    position: absolute;
    inset: 0 40px 0 0;
    overflow: hidden;
    border-radius: 30px;
  }

  .ga-story-image-main img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 1s cubic-bezier(.22,1,.36,1);
  }

  .ga-story:hover .ga-story-image-main img {
    transform: scale(1.045);
  }

  .ga-story-image-small {
    position: absolute;
    right: 0;
    bottom: 35px;
    width: 190px;
    height: 240px;
    overflow: hidden;
    border: 8px solid #fff;
    border-radius: 22px;
    box-shadow: 0 25px 55px rgba(70,20,35,.18);
  }

  .ga-story-image-small img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ga-story-copy {
    max-width: 570px;
  }

  .ga-story-copy h3 {
    margin: 15px 0 22px;
    color: var(--ga-navy);
    font-family: Georgia, serif;
    font-size: clamp(36px, 4vw, 56px);
    line-height: 1.05;
    font-weight: 500;
    letter-spacing: -1.7px;
  }

  .ga-story-copy h3 em {
    color: var(--ga-wine);
    font-style: italic;
  }

  .ga-story-copy p {
    margin: 0 0 18px;
    color: var(--ga-muted);
    font-size: 15px;
    line-height: 2;
  }

  .ga-check-list {
    display: grid;
    gap: 12px;
    margin-top: 28px;
  }

  .ga-check-item {
    display: flex;
    align-items: center;
    gap: 11px;
    color: var(--ga-navy);
    font-size: 13px;
    font-weight: 800;
  }

  .ga-check-icon {
    width: 25px;
    height: 25px;
    flex: 0 0 25px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--ga-blush);
    color: var(--ga-wine);
  }

  /* =====================================================
     DARK SCIENCE
  ===================================================== */

  .ga-science {
    position: relative;
    overflow: hidden;
    padding: 125px 0;
    background: var(--ga-navy);
    color: #fff;
  }

  .ga-science::before {
    content: "";
    position: absolute;
    width: 550px;
    height: 550px;
    right: -180px;
    top: -230px;
    border: 1px solid rgba(244,182,194,.16);
    border-radius: 50%;
  }

  .ga-science::after {
    content: "";
    position: absolute;
    width: 760px;
    height: 760px;
    left: -450px;
    bottom: -500px;
    border: 1px solid rgba(244,182,194,.10);
    border-radius: 50%;
  }

  .ga-science-inner {
    position: relative;
    z-index: 2;
    width: min(1240px, calc(100% - 50px));
    margin: 0 auto;
  }

  .ga-science-head {
    max-width: 750px;
    margin-bottom: 60px;
  }

  .ga-science-head .ga-section-label {
    color: var(--ga-pink);
  }

  .ga-science-title {
    margin: 15px 0 0;
    color: #fff;
    font-family: Georgia, serif;
    font-size: clamp(38px, 5vw, 66px);
    line-height: 1.05;
    font-weight: 500;
    letter-spacing: -2px;
  }

  .ga-science-title em {
    color: var(--ga-pink);
    font-style: italic;
  }

  .ga-science-text {
    max-width: 650px;
    margin-top: 20px;
    color: rgba(255,255,255,.64);
    font-size: 15px;
    line-height: 1.95;
  }

  .ga-science-grid {
    display: grid;
    grid-template-columns: 1.15fr .85fr;
    gap: 25px;
  }

  .ga-science-image {
    min-height: 520px;
    overflow: hidden;
    border-radius: 28px;
  }

  .ga-science-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 1.2s cubic-bezier(.22,1,.36,1);
  }

  .ga-science-image:hover img {
    transform: scale(1.05);
  }

  .ga-science-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }

  .ga-science-card {
    min-height: 245px;
    padding: 25px;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 22px;
    background: rgba(255,255,255,.045);
    backdrop-filter: blur(10px);
    transition:
      transform .3s ease,
      background .3s ease,
      border-color .3s ease;
  }

  .ga-science-card:hover {
    transform: translateY(-7px);
    background: rgba(255,255,255,.075);
    border-color: rgba(244,182,194,.28);
  }

  .ga-science-icon {
    width: 45px;
    height: 45px;
    display: grid;
    place-items: center;
    margin-bottom: 20px;
    border-radius: 14px;
    background: rgba(244,182,194,.12);
    color: var(--ga-pink);
  }

  .ga-science-card h4 {
    margin: 0 0 10px;
    color: #fff;
    font-size: 16px;
    font-weight: 900;
  }

  .ga-science-card p {
    margin: 0;
    color: rgba(255,255,255,.57);
    font-size: 12px;
    line-height: 1.8;
  }

  /* =====================================================
     VALUES
  ===================================================== */

  .ga-values-head {
    max-width: 700px;
    margin-bottom: 55px;
  }

  .ga-values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .ga-value-card {
    position: relative;
    min-height: 280px;
    padding: 29px;
    overflow: hidden;
    border: 1px solid var(--ga-line);
    border-radius: 25px;
    background: #fff;
    transition:
      transform .3s ease,
      box-shadow .3s ease,
      border-color .3s ease;
  }

  .ga-value-card:hover {
    transform: translateY(-8px);
    border-color: rgba(139,21,56,.18);
    box-shadow: 0 22px 50px rgba(70,20,35,.09);
  }

  .ga-value-number {
    position: absolute;
    right: 20px;
    top: 8px;
    color: rgba(139,21,56,.055);
    font-family: Georgia, serif;
    font-size: 100px;
    line-height: 1;
    font-weight: 500;
  }

  .ga-value-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    margin-bottom: 25px;
    border-radius: 15px;
    background: var(--ga-blush);
    color: var(--ga-wine);
  }

  .ga-value-card h3 {
    margin: 0 0 11px;
    color: var(--ga-navy);
    font-family: Georgia, serif;
    font-size: 24px;
    font-weight: 500;
  }

  .ga-value-card p {
    max-width: 300px;
    margin: 0;
    color: var(--ga-muted);
    font-size: 13px;
    line-height: 1.85;
  }

  /* =====================================================
     TIMELINE
  ===================================================== */

  .ga-timeline-section {
    background: var(--ga-soft);
  }

  .ga-timeline-head {
    text-align: center;
    max-width: 680px;
    margin: 0 auto 70px;
  }

  .ga-timeline {
    position: relative;
    max-width: 920px;
    margin: 0 auto;
  }

  .ga-timeline::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--ga-line);
    transform: translateX(-50%);
  }

  .ga-timeline-item {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 70px;
    margin-bottom: 70px;
  }

  .ga-timeline-item:last-child {
    margin-bottom: 0;
  }

  .ga-timeline-content {
    padding: 8px 0;
  }

  .ga-timeline-item:nth-child(even) .ga-timeline-content:first-child {
    order: 2;
  }

  .ga-timeline-item:nth-child(even) .ga-timeline-content:last-child {
    order: 1;
    text-align: right;
  }

  .ga-timeline-year {
    color: var(--ga-wine);
    font-family: Georgia, serif;
    font-size: 18px;
  }

  .ga-timeline-content h3 {
    margin: 7px 0 10px;
    color: var(--ga-navy);
    font-family: Georgia, serif;
    font-size: 27px;
    font-weight: 500;
  }

  .ga-timeline-content p {
    margin: 0;
    color: var(--ga-muted);
    font-size: 13px;
    line-height: 1.9;
  }

  .ga-timeline-dot {
    position: absolute;
    left: 50%;
    top: 13px;
    width: 13px;
    height: 13px;
    border: 3px solid var(--ga-soft);
    border-radius: 50%;
    background: var(--ga-wine);
    box-shadow: 0 0 0 5px rgba(139,21,56,.10);
    transform: translateX(-50%);
    z-index: 2;
  }

  /* =====================================================
     IMAGE MOSAIC
  ===================================================== */

  .ga-gallery {
    display: grid;
    grid-template-columns: 1.05fr .7fr .7fr;
    grid-template-rows: 250px 250px;
    gap: 15px;
  }

  .ga-gallery-item {
    position: relative;
    overflow: hidden;
    border-radius: 22px;
  }

  .ga-gallery-item:first-child {
    grid-row: span 2;
  }

  .ga-gallery-item:last-child {
    grid-column: span 2;
  }

  .ga-gallery-item img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform 1s cubic-bezier(.22,1,.36,1);
  }

  .ga-gallery-item:hover img {
    transform: scale(1.07);
  }

  .ga-gallery-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    padding: 23px;
    background: linear-gradient(
      to top,
      rgba(23,33,60,.65),
      transparent 55%
    );
    color: #fff;
    opacity: 0;
    transition: opacity .3s ease;
  }

  .ga-gallery-item:hover .ga-gallery-overlay {
    opacity: 1;
  }

  .ga-gallery-overlay span {
    font-size: 12px;
    font-weight: 850;
  }

  /* =====================================================
     CTA
  ===================================================== */

  .ga-final {
    position: relative;
    overflow: hidden;
    width: min(1240px, calc(100% - 50px));
    margin: 0 auto 90px;
    padding: 90px 60px;
    border-radius: 35px;
    background:
      radial-gradient(
        circle at 85% 15%,
        rgba(244,182,194,.24),
        transparent 28%
      ),
      linear-gradient(
        135deg,
        var(--ga-wine-deep),
        var(--ga-wine)
      );
    color: #fff;
  }

  .ga-final::before,
  .ga-final::after {
    content: "";
    position: absolute;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 50%;
  }

  .ga-final::before {
    width: 500px;
    height: 500px;
    right: -250px;
    top: -260px;
  }

  .ga-final::after {
    width: 300px;
    height: 300px;
    left: -190px;
    bottom: -210px;
  }

  .ga-final-inner {
    position: relative;
    z-index: 2;
    max-width: 760px;
  }

  .ga-final-label {
    color: var(--ga-pink);
    font-size: 11px;
    font-weight: 950;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .ga-final h2 {
    margin: 15px 0 18px;
    font-family: Georgia, serif;
    font-size: clamp(40px, 5vw, 68px);
    line-height: 1.03;
    font-weight: 500;
    letter-spacing: -2px;
  }

  .ga-final p {
    max-width: 600px;
    margin: 0;
    color: rgba(255,255,255,.72);
    font-size: 15px;
    line-height: 1.9;
  }

  .ga-final-btn {
    margin-top: 30px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 51px;
    padding: 0 23px;
    border-radius: 14px;
    background: #fff;
    color: var(--ga-wine) !important;
    text-decoration: none;
    font-size: 14px;
    font-weight: 950;
    transition:
      transform .25s ease,
      box-shadow .25s ease;
  }

  .ga-final-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 30px rgba(0,0,0,.16);
  }

  .ga-final-btn * {
    color: var(--ga-wine) !important;
  }

  /* =====================================================
     RESPONSIVE
  ===================================================== */

  @media (max-width: 1050px) {
    .ga-hero-grid {
      grid-template-columns: 1fr 1fr;
      gap: 35px;
    }

    .ga-hero-visual {
      height: 560px;
    }

    .ga-intro {
      gap: 45px;
    }

    .ga-story {
      gap: 45px;
    }

    .ga-science-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 800px) {
    .ga-hero {
      min-height: auto;
      padding: 75px 0 80px;
    }

    .ga-hero-grid {
      width: min(100% - 28px, 600px);
      grid-template-columns: 1fr;
      gap: 45px;
    }

    .ga-hero-title {
      font-size: clamp(48px, 13vw, 72px);
      letter-spacing: -2px;
    }

    .ga-hero-visual {
      height: 540px;
    }

    .ga-hero-image-frame {
      inset: 0 15px 0 15px;
      border-radius: 170px 170px 24px 24px;
    }

    .ga-floating-card {
      left: 0;
      bottom: 35px;
    }

    .ga-scroll {
      display: none;
    }

    .ga-section {
      width: min(100% - 28px, 600px);
      padding: 85px 0;
    }

    .ga-intro,
    .ga-story {
      grid-template-columns: 1fr;
      gap: 45px;
    }

    .ga-story.reverse .ga-story-image {
      order: 0;
    }

    .ga-story-image {
      min-height: 500px;
    }

    .ga-stats-grid {
      width: min(100% - 28px, 600px);
      grid-template-columns: 1fr 1fr;
    }

    .ga-stat:nth-child(3)::before {
      display: none;
    }

    .ga-stat:nth-child(3),
    .ga-stat:nth-child(4) {
      border-top: 1px solid var(--ga-line);
    }

    .ga-values-grid {
      grid-template-columns: 1fr;
    }

    .ga-gallery {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 260px 200px 200px;
    }

    .ga-gallery-item:first-child {
      grid-column: span 2;
      grid-row: auto;
    }

    .ga-gallery-item:last-child {
      grid-column: span 2;
    }

    .ga-timeline::before {
      left: 8px;
    }

    .ga-timeline-item {
      grid-template-columns: 1fr;
      gap: 8px;
      padding-left: 35px;
      margin-bottom: 45px;
    }

    .ga-timeline-item:nth-child(even) .ga-timeline-content:first-child,
    .ga-timeline-item:nth-child(even) .ga-timeline-content:last-child {
      order: initial;
      text-align: start;
    }

    .ga-timeline-dot {
      left: 8px;
    }

    .ga-final {
      width: min(100% - 28px, 600px);
      margin-bottom: 55px;
      padding: 65px 25px;
      border-radius: 27px;
    }
  }

  @media (max-width: 520px) {
    .ga-hero-visual {
      height: 450px;
    }

    .ga-floating-card {
      width: 175px;
      padding: 15px;
    }

    .ga-floating-card strong {
      font-size: 18px;
    }

    .ga-stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .ga-stat {
      padding: 35px 12px;
    }

    .ga-stat-number {
      font-size: 38px;
    }

    .ga-science-cards {
      grid-template-columns: 1fr;
    }

    .ga-science-card {
      min-height: auto;
    }

    .ga-story-image {
      min-height: 410px;
    }

    .ga-story-image-small {
      width: 135px;
      height: 175px;
    }

    .ga-gallery {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(4, 240px);
    }

    .ga-gallery-item:first-child,
    .ga-gallery-item:last-child {
      grid-column: auto;
    }

    .ga-final h2 {
      font-size: 42px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ga-page *,
    .ga-page *::before,
    .ga-page *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: .01ms !important;
    }
  }
`;

export default function AboutPage({
  params,
}: AboutPageProps) {
  const locale = (
    params?.locale === "en" ? "en" : "ar"
  ) as Locale;

  const isAr = locale === "ar";

  const rootRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    years: 0,
    products: 0,
    customers: 0,
    rating: 0,
  });

  useEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "ga-visible"
            );
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    const revealElements =
      root.querySelectorAll(".ga-reveal");

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

    return () => {
      revealObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const duration = 1700;
    const start = performance.now();

    const target = {
      years: 6,
      products: 240,
      customers: 18000,
      rating: 4.9,
    };

    const animate = (now: number) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 4);

      setStats({
        years: Math.round(
          target.years * eased
        ),
        products: Math.round(
          target.products * eased
        ),
        customers: Math.round(
          target.customers * eased
        ),
        rating:
          Math.round(
            target.rating * eased * 10
          ) / 10,
      });

      if (progress < 1) {
        frame = requestAnimationFrame(
          animate
        );
      }
    };

    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(
        animate
      );
    }, 400);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  const Arrow = isAr
    ? ArrowLeft
    : ArrowRight;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `${BASE_CSS}\n${ABOUT_CSS}`,
        }}
      />

      <div
        ref={rootRef}
        dir={isAr ? "rtl" : "ltr"}
        className="ga-page gl-page"
      >
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="ga-hero">
          <div className="ga-hero-grid">
            <div className="ga-hero-copy">
              <div className="ga-eyebrow ga-reveal">
                <span className="ga-eyebrow-line" />

                {isAr
                  ? "قصة Glamora"
                  : "The Glamora story"}
              </div>

              <h1 className="ga-hero-title ga-reveal ga-delay-1">
                {isAr ? (
                  <>
                    الجمال
                    <br />
                    <em>يبدأ منك.</em>
                  </>
                ) : (
                  <>
                    Beauty
                    <br />
                    <em>begins with you.</em>
                  </>
                )}
              </h1>

              <p className="ga-hero-text ga-reveal ga-delay-2">
                {isAr
                  ? "في Glamora، لا نؤمن بأن الجمال له شكل واحد. نحن نبني تجربة تجمع بين العناية، الاكتشاف، والثقة — لتجدي ما يناسبك أنتِ."
                  : "At Glamora, we don't believe beauty has one definition. We create an experience where care, discovery, and confidence come together — to help you find what feels right for you."}
              </p>

              <div className="ga-hero-actions ga-reveal ga-delay-3">
                <Link
                  href={`/${locale}/products`}
                  className="ga-primary-btn"
                >
                  {isAr
                    ? "اكتشفي المجموعة"
                    : "Explore the collection"}

                  <Arrow size={17} />
                </Link>

                <Link
                  href={`/${locale}/products`}
                  className="ga-secondary-btn"
                >
                  {isAr
                    ? "اكتشفي روتينك"
                    : "Find your ritual"}

                  <Sparkles size={17} />
                </Link>
              </div>
            </div>

            <div className="ga-hero-visual ga-reveal ga-delay-2">
              <div className="ga-hero-image-frame">
                <img
                  src={IMAGES.hero}
                  alt={
                    isAr
                      ? "منتجات Glamora للعناية والجمال"
                      : "Luxury beauty collection"
                  }
                />

                <div className="ga-hero-image-overlay" />
              </div>

              <div className="ga-floating-card">
                <small>
                  {isAr
                    ? "فلسفة Glamora"
                    : "Glamora philosophy"}
                </small>

                <strong>
                  {isAr
                    ? "اختاري ما يشبهك"
                    : "Choose what feels like you"}
                </strong>

                <span>
                  {isAr
                    ? "Beauty • Care • Confidence"
                    : "Beauty • Care • Confidence"}
                </span>
              </div>

              <div className="ga-orbit" />
            </div>
          </div>

          <div className="ga-scroll">
            <span>
              {isAr ? "اكتشفي" : "Discover"}
            </span>

            <ArrowDown size={15} />
          </div>
        </section>

        {/* =====================================================
            MARQUEE
        ===================================================== */}

        <div className="ga-marquee">
          <div className="ga-marquee-track">
            {Array.from({
              length: 2,
            }).map((_, group) => (
              <div
                key={group}
                className="ga-marquee-item"
              >
                <span>
                  {isAr
                    ? "جمال مصمم ليكون لكِ"
                    : "Beauty made personal"}
                </span>

                <span className="ga-marquee-dot">
                  ✦
                </span>

                <span>
                  {isAr
                    ? "عناية بوعي"
                    : "Conscious care"}
                </span>

                <span className="ga-marquee-dot">
                  ✦
                </span>

                <span>
                  {isAr
                    ? "اختيارات أذكى"
                    : "Smarter choices"}
                </span>

                <span className="ga-marquee-dot">
                  ✦
                </span>

                <span>
                  {isAr
                    ? "ثقة تبدأ من الداخل"
                    : "Confidence from within"}
                </span>

                <span className="ga-marquee-dot">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            INTRO
        ===================================================== */}

        <section className="ga-section">
          <div className="ga-intro">
            <div className="ga-reveal">
              <div className="ga-section-label">
                01 —{" "}
                {isAr
                  ? "من نحن"
                  : "Who we are"}
              </div>

              <h2 className="ga-section-title">
                {isAr ? (
                  <>
                    أكثر من متجر.
                    <br />
                    <em>تجربة جمال.</em>
                  </>
                ) : (
                  <>
                    More than a store.
                    <br />
                    <em>A beauty experience.</em>
                  </>
                )}
              </h2>
            </div>

            <div className="ga-intro-copy ga-reveal ga-delay-2">
              <p>
                {isAr
                  ? "Glamora هي مساحة تجمع المنتجات التي تحبينها مع تجربة تساعدك على اكتشاف ما يناسبك فعلًا."
                  : "Glamora is a space where the products you love meet an experience designed to help you discover what truly fits you."}
              </p>

              <p>
                {isAr
                  ? "من العناية بالبشرة إلى المكياج، صممنا التجربة لتكون بسيطة، راقية، وشخصية. لأن اختيار منتج جديد لا يجب أن يكون مجرد عملية شراء — بل لحظة تعرفين فيها نفسك أكثر."
                  : "From skincare to makeup, we designed the experience to feel simple, refined, and personal. Because choosing a new product should not feel like a transaction — it should feel like discovering a little more about yourself."}
              </p>

              <p>
                {isAr
                  ? "نحن نؤمن أن أفضل Beauty Experience هي التي تجعلك تشعرين بالراحة والثقة قبل أن تضعي المنتج في السلة."
                  : "We believe the best beauty experience is the one that makes you feel understood and confident before you ever add a product to your cart."}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="ga-stats">
          <div className="ga-stats-grid">
            <div className="ga-stat ga-reveal">
              <div className="ga-stat-number">
                {stats.years}+
              </div>

              <div className="ga-stat-label">
                {isAr
                  ? "سنوات من الشغف"
                  : "Years of passion"}
              </div>
            </div>

            <div className="ga-stat ga-reveal ga-delay-1">
              <div className="ga-stat-number">
                {stats.products}+
              </div>

              <div className="ga-stat-label">
                {isAr
                  ? "منتج مختار"
                  : "Curated products"}
              </div>
            </div>

            <div className="ga-stat ga-reveal ga-delay-2">
              <div className="ga-stat-number">
                {stats.customers >= 1000
                  ? `${Math.round(
                      stats.customers / 1000
                    )}K+`
                  : stats.customers}
              </div>

              <div className="ga-stat-label">
                {isAr
                  ? "عميلة سعيدة"
                  : "Happy customers"}
              </div>
            </div>

            <div className="ga-stat ga-reveal ga-delay-3">
              <div className="ga-stat-number">
                {stats.rating}
              </div>

              <div className="ga-stat-label">
                {isAr
                  ? "متوسط التقييم"
                  : "Average rating"}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STORY 1
        ===================================================== */}

        <section className="ga-section">
          <div className="ga-story">
            <div className="ga-story-image ga-reveal">
              <div className="ga-story-image-main">
                <img
                  src={IMAGES.beauty}
                  alt={
                    isAr
                      ? "تجربة جمال Glamora"
                      : "Glamora beauty experience"
                  }
                  loading="lazy"
                />
              </div>

              <div className="ga-story-image-small">
                <img
                  src={IMAGES.collection}
                  alt="Beauty products"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="ga-story-copy ga-reveal ga-delay-2">
              <div className="ga-section-label">
                02 —{" "}
                {isAr
                  ? "الفكرة"
                  : "The idea"}
              </div>

              <h3>
                {isAr ? (
                  <>
                    لأن روتينك
                    <br />
                    <em>يستحق أن يكون جميلًا.</em>
                  </>
                ) : (
                  <>
                    Because your ritual
                    <br />
                    <em>deserves to feel beautiful.</em>
                  </>
                )}
              </h3>

              <p>
                {isAr
                  ? "الجمال بالنسبة لنا ليس مجرد نتيجة نهائية. هو الوقت الذي تمنحينه لنفسك، التفاصيل الصغيرة، واللحظة التي تشعرين فيها أنكِ تهتمين بنفسك."
                  : "Beauty is not just the final result to us. It is the time you give yourself, the little details, and the moment you realize you are taking care of you."}
              </p>

              <p>
                {isAr
                  ? "لهذا بنينا Glamora حول فكرة بسيطة: نجعل اكتشاف المنتجات والعناية بنفسك تجربة تستحق التكرار."
                  : "That is why we built Glamora around one simple idea: make discovering products and taking care of yourself an experience worth repeating."}
              </p>

              <div className="ga-check-list">
                {[
                  isAr
                    ? "اختيارات مدروسة"
                    : "Thoughtfully curated",
                  isAr
                    ? "تجربة بسيطة وواضحة"
                    : "Simple, intuitive experience",
                  isAr
                    ? "تصميم يهتم بالتفاصيل"
                    : "Detail-driven design",
                  isAr
                    ? "الجمال بدون تعقيد"
                    : "Beauty without the complexity",
                ].map((item) => (
                  <div
                    key={item}
                    className="ga-check-item"
                  >
                    <span className="ga-check-icon">
                      <Check size={14} />
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SCIENCE
        ===================================================== */}

        <section className="ga-science">
          <div className="ga-science-inner">
            <div className="ga-science-head ga-reveal">
              <div className="ga-section-label">
                03 —{" "}
                {isAr
                  ? "الجمال × المعرفة"
                  : "Beauty × Knowledge"}
              </div>

              <h2 className="ga-science-title">
                {isAr ? (
                  <>
                    الجمال إحساس.
                    <br />
                    <em>والاختيار معرفة.</em>
                  </>
                ) : (
                  <>
                    Beauty is a feeling.
                    <br />
                    <em>Choosing is knowledge.</em>
                  </>
                )}
              </h2>

              <p className="ga-science-text">
                {isAr
                  ? "نريد أن تكون تجربة Glamora أكثر من مجرد صور جميلة. كل جزء من التجربة مصمم ليساعدك على فهم ما تختارينه بشكل أفضل."
                  : "We want Glamora to be more than beautiful visuals. Every part of the experience is designed to help you understand your choices better."}
              </p>
            </div>

            <div className="ga-science-grid">
              <div className="ga-science-image ga-reveal">
                <img
                  src={IMAGES.laboratory}
                  alt={
                    isAr
                      ? "العناية والجمال والبحث"
                      : "Beauty research and formulation"
                  }
                  loading="lazy"
                />
              </div>

              <div className="ga-science-cards">
                <div className="ga-science-card ga-reveal">
                  <div className="ga-science-icon">
                    <Microscope size={22} />
                  </div>

                  <h4>
                    {isAr
                      ? "اختيار بوعي"
                      : "Mindful selection"}
                  </h4>

                  <p>
                    {isAr
                      ? "نركز على تقديم المعلومات بطريقة تساعدك على اتخاذ قرار أكثر وضوحًا."
                      : "We focus on presenting information in a way that makes your decision clearer."}
                  </p>
                </div>

                <div className="ga-science-card ga-reveal ga-delay-1">
                  <div className="ga-science-icon">
                    <Beaker size={22} />
                  </div>

                  <h4>
                    {isAr
                      ? "تركيبات واهتمام"
                      : "Formula focused"}
                  </h4>

                  <p>
                    {isAr
                      ? "التفاصيل مهمة، من نوع البشرة إلى المكونات وطريقة الاستخدام."
                      : "Details matter, from skin type to ingredients and how a product fits your routine."}
                  </p>
                </div>

                <div className="ga-science-card ga-reveal ga-delay-2">
                  <div className="ga-science-icon">
                    <Leaf size={22} />
                  </div>

                  <h4>
                    {isAr
                      ? "روتين شخصي"
                      : "Personal rituals"}
                  </h4>

                  <p>
                    {isAr
                      ? "لا نريد أن نخبرك بما يجب أن تحبي. نريد أن نساعدك في اكتشاف ما يناسبك."
                      : "We do not tell you what to love. We help you discover what works for you."}
                  </p>
                </div>

                <div className="ga-science-card ga-reveal ga-delay-3">
                  <div className="ga-science-icon">
                    <Heart size={22} />
                  </div>

                  <h4>
                    {isAr
                      ? "ثقة أولًا"
                      : "Confidence first"}
                  </h4>

                  <p>
                    {isAr
                      ? "الهدف النهائي ليس منتجًا جديدًا، بل شعور أفضل تجاه نفسك."
                      : "The ultimate goal is not another product, but a better feeling about yourself."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            VALUES
        ===================================================== */}

        <section className="ga-section">
          <div className="ga-values-head ga-reveal">
            <div className="ga-section-label">
              04 —{" "}
              {isAr
                ? "قيمنا"
                : "Our values"}
            </div>

            <h2 className="ga-section-title">
              {isAr ? (
                <>
                  الأشياء التي
                  <br />
                  <em>نؤمن بها.</em>
                </>
              ) : (
                <>
                  The things
                  <br />
                  <em>we believe in.</em>
                </>
              )}
            </h2>
          </div>

          <div className="ga-values-grid">
            <div className="ga-value-card ga-reveal">
              <span className="ga-value-number">
                01
              </span>

              <div className="ga-value-icon">
                <Sparkles size={21} />
              </div>

              <h3>
                {isAr
                  ? "الجمال الشخصي"
                  : "Personal beauty"}
              </h3>

              <p>
                {isAr
                  ? "لا توجد قاعدة واحدة للجمال. روتينك يجب أن يعبر عنك أنت."
                  : "There is no single rule for beauty. Your ritual should feel like you."}
              </p>
            </div>

            <div className="ga-value-card ga-reveal ga-delay-1">
              <span className="ga-value-number">
                02
              </span>

              <div className="ga-value-icon">
                <Target size={21} />
              </div>

              <h3>
                {isAr
                  ? "البساطة"
                  : "Simplicity"}
              </h3>

              <p>
                {isAr
                  ? "نزيل الضوضاء ونترك لك الأشياء التي تحتاجينها فعلًا."
                  : "We remove the noise and leave you with what actually matters."}
              </p>
            </div>

            <div className="ga-value-card ga-reveal ga-delay-2">
              <span className="ga-value-number">
                03
              </span>

              <div className="ga-value-icon">
                <Award size={21} />
              </div>

              <h3>
                {isAr
                  ? "الجودة"
                  : "Quality"}
              </h3>

              <p>
                {isAr
                  ? "التفاصيل الصغيرة هي التي تصنع التجربة الكبيرة."
                  : "The small details are what create the big experience."}
              </p>
            </div>

            <div className="ga-value-card ga-reveal">
              <span className="ga-value-number">
                04
              </span>

              <div className="ga-value-icon">
                <Users size={21} />
              </div>

              <h3>
                {isAr
                  ? "المجتمع"
                  : "Community"}
              </h3>

              <p>
                {isAr
                  ? "نريد أن تكون Glamora مساحة تشارك فيها النساء تجاربهن وتكتشفن الجديد."
                  : "We want Glamora to be a space where women share experiences and discover what is next."}
              </p>
            </div>

            <div className="ga-value-card ga-reveal ga-delay-1">
              <span className="ga-value-number">
                05
              </span>

              <div className="ga-value-icon">
                <Leaf size={21} />
              </div>

              <h3>
                {isAr
                  ? "وعي أكثر"
                  : "More awareness"}
              </h3>

              <p>
                {isAr
                  ? "كلما فهمتِ ما تستخدمينه، أصبح روتينك أكثر ذكاءً."
                  : "The more you understand what you use, the smarter your ritual becomes."}
              </p>
            </div>

            <div className="ga-value-card ga-reveal ga-delay-2">
              <span className="ga-value-number">
                06
              </span>

              <div className="ga-value-icon">
                <Heart size={21} />
              </div>

              <h3>
                {isAr
                  ? "الحب في التفاصيل"
                  : "Love the details"}
              </h3>

              <p>
                {isAr
                  ? "من أول نقرة حتى لحظة وصول طلبك، نريد لكل تفصيلة أن تكون محسوبة."
                  : "From the first click to the moment your order arrives, every detail should feel intentional."}
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            TIMELINE
        ===================================================== */}

        <section className="ga-timeline-section">
          <div className="ga-section">
            <div className="ga-timeline-head ga-reveal">
              <div className="ga-section-label">
                05 —{" "}
                {isAr
                  ? "رحلتنا"
                  : "Our journey"}
              </div>

              <h2 className="ga-section-title">
                {isAr ? (
                  <>
                    من فكرة صغيرة
                    <br />
                    <em>إلى عالم كامل.</em>
                  </>
                ) : (
                  <>
                    From a small idea
                    <br />
                    <em>to a whole world.</em>
                  </>
                )}
              </h2>
            </div>

            <div className="ga-timeline">
              <div className="ga-timeline-item ga-reveal">
                <div className="ga-timeline-content">
                  <div className="ga-timeline-year">
                    2021
                  </div>

                  <h3>
                    {isAr
                      ? "البداية"
                      : "The beginning"}
                  </h3>

                  <p>
                    {isAr
                      ? "بدأت الفكرة من سؤال بسيط: كيف يمكن أن نجعل اختيار منتجات الجمال أسهل وأكثر شخصية؟"
                      : "It started with a simple question: how can choosing beauty products become easier and more personal?"}
                  </p>
                </div>

                <div />
                <span className="ga-timeline-dot" />
              </div>

              <div className="ga-timeline-item ga-reveal">
                <div className="ga-timeline-content">
                  <div className="ga-timeline-year">
                    2022
                  </div>

                  <h3>
                    {isAr
                      ? "أول مجموعة"
                      : "First collection"}
                  </h3>

                  <p>
                    {isAr
                      ? "بدأنا ببناء مجموعة مختارة بعناية، مع التركيز على الجودة والتجربة قبل كل شيء."
                      : "We started building a carefully curated collection, putting quality and experience first."}
                  </p>
                </div>

                <div />
                <span className="ga-timeline-dot" />
              </div>

              <div className="ga-timeline-item ga-reveal">
                <div className="ga-timeline-content">
                  <div className="ga-timeline-year">
                    2024
                  </div>

                  <h3>
                    {isAr
                      ? "Glamora تكبر"
                      : "Glamora grows"}
                  </h3>

                  <p>
                    {isAr
                      ? "أصبحت التجربة أكبر، وأصبح لدينا عالم كامل من المنتجات والروتينات والاكتشاف."
                      : "The experience grew into a wider world of products, rituals, and discovery."}
                  </p>
                </div>

                <div />
                <span className="ga-timeline-dot" />
              </div>

              <div className="ga-timeline-item ga-reveal">
                <div className="ga-timeline-content">
                  <div className="ga-timeline-year">
                    2026
                  </div>

                  <h3>
                    {isAr
                      ? "الفصل القادم"
                      : "The next chapter"}
                  </h3>

                  <p>
                    {isAr
                      ? "نواصل بناء تجربة Beauty أكثر ذكاءً، شخصية، ومتعة — لأن أفضل ما في Glamora لم يأتِ بعد."
                      : "We continue building a smarter, more personal, more delightful beauty experience — because the best of Glamora is still ahead."}
                  </p>
                </div>

                <div />
                <span className="ga-timeline-dot" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            GALLERY
        ===================================================== */}

        <section className="ga-section">
          <div className="ga-values-head ga-reveal">
            <div className="ga-section-label">
              06 —{" "}
              {isAr
                ? "عالم Glamora"
                : "The Glamora world"}
            </div>

            <h2 className="ga-section-title">
              {isAr ? (
                <>
                  جمال تراه.
                  <br />
                  <em>وتشعر به.</em>
                </>
              ) : (
                <>
                  Beauty you can see.
                  <br />
                  <em>And feel.</em>
                </>
              )}
            </h2>
          </div>

          <div className="ga-gallery">
            <div className="ga-gallery-item ga-reveal">
              <img
                src={IMAGES.ritual}
                alt="Beauty ritual"
                loading="lazy"
              />

              <div className="ga-gallery-overlay">
                <span>
                  {isAr
                    ? "طقوس الجمال"
                    : "Beauty rituals"}
                </span>
              </div>
            </div>

            <div className="ga-gallery-item ga-reveal ga-delay-1">
              <img
                src={IMAGES.dark}
                alt="Luxury cosmetics"
                loading="lazy"
              />

              <div className="ga-gallery-overlay">
                <span>
                  {isAr
                    ? "تفاصيل فاخرة"
                    : "Luxury details"}
                </span>
              </div>
            </div>

            <div className="ga-gallery-item ga-reveal ga-delay-2">
              <img
                src={IMAGES.collection}
                alt="Skincare collection"
                loading="lazy"
              />

              <div className="ga-gallery-overlay">
                <span>
                  {isAr
                    ? "العناية"
                    : "Skincare"}
                </span>
              </div>
            </div>

            <div className="ga-gallery-item ga-reveal ga-delay-3">
              <img
                src={IMAGES.hero}
                alt="Glamora beauty collection"
                loading="lazy"
              />

              <div className="ga-gallery-overlay">
                <span>
                  {isAr
                    ? "Glamora"
                    : "Glamora"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="ga-final ga-reveal">
          <div className="ga-final-inner">
            <div className="ga-final-label">
              07 —{" "}
              {isAr
                ? "ابدئي رحلتك"
                : "Start your journey"}
            </div>

            <h2>
              {isAr ? (
                <>
                  اكتشفي الجمال
                  <br />
                  <em>بطريقتك.</em>
                </>
              ) : (
                <>
                  Discover beauty
                  <br />
                  <em>your way.</em>
                </>
              )}
            </h2>

            <p>
              {isAr
                ? "اختاري المنتجات التي تناسبك، اكتشفي روتينًا جديدًا، واجعلي كل لحظة عناية بنفسك شيئًا تتطلعين إليه."
                : "Explore products that fit you, discover a new ritual, and make every moment of self-care something you look forward to."}
            </p>

            <Link
              href={`/${locale}/products`}
              className="ga-final-btn"
            >
              {isAr
                ? "تسوقي الآن"
                : "Shop now"}

              <Arrow size={17} />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}