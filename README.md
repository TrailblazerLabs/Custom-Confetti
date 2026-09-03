# Custom Confetti

## Overview
Give your users confetti they can get excited about. No developer required. Put this LWC on any record page layout, pick the field and value that should trigger it, and it showers them with a custom-coloured celebration.

## The Problem It Solves
We love confetti in Salesforce, so why limit ourselves to just the confetti that comes out of the box? Usually you need a Path and an end status to trigger the celebration, but no longer are you restricted to celebrating only the wins Path recognises. Custom Confetti puts that moment of delight in an admin's hands: drag and drop this invisible LWC component onto any record page layout, select a field, pick a trigger value, and it's live. Every colour theme lives in Custom Metadata, so it's reskinnable from Setup, any time, with zero code changes and zero redeployments.

## See it in Action
📺 [Watch the full install + demo](https://paceymia.github.io/Salesforce-Guides/guides/confetti-lwc-install.html) — download, deploy, drag-and-drop, confetti, all in one clip.

## Quick Start Guide

### Prerequisites
- A Salesforce org with Lightning Experience enabled (any edition)
- For Option 2 only: the [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) (`sf`), authorised against your target org

### Option 1: 1-Click Install (Recommended for Admins)
Deploy this asset directly to your Sandbox or Developer Edition org without touching the command line.

[![Deploy to Salesforce](https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png)](https://githubsfdeploy.herokuapp.com?owner=TrailblazerLabs&repo=Custom-Confetti)

### Option 2: Install via Salesforce CLI (For Developers)
1. Clone this repository:
   `git clone https://github.com/TrailblazerLabs/Custom-Confetti.git`
2. Deploy the metadata to your target org:
   `sf project deploy start --target-org your-alias --source-dir force-app`

### Post-Installation Steps
1. Open any record page in **Lightning App Builder** and drag **Custom Confetti** onto the page — it's invisible on screen, so placement doesn't matter
2. Fill in the three properties: **Field API Path** (e.g. `Opportunity.StageName`), **Trigger Value** (e.g. `Closed Won`), and **Confetti Theme** — paste the theme's **API Name**, not its Label (e.g. `Green_Yellow`, not "Green Yellow")
3. Save and **Activate**

## About the Creator
Built by [@PaceyMia](https://github.com/PaceyMia) as part of the Trailblazer Labs Builder in Residence Cohort.
