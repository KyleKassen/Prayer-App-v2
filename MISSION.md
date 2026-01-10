MISSION SPECIFICATION: Universal Prayer Application (Multi-Tenant)
1. Project Overview
We are engineering a high-fidelity, mobile-first "Prayer App" designed for multi-tenant church communities. The application allows users to join specific organizations via secure invite codes, post prayer requests, and engage in community intercession. The aesthetic is "Spiritual Minimalist"—clean, serene, and focused on text and community.
Core Technology Stack:
Frontend: React Native (Expo SDK 50+)
Routing: Expo Router v3 (File-system routing)
Language: TypeScript (Strict Mode)
Styling: NativeWind v4 (Tailwind CSS)
State Management: TanStack Query v5 (React Query)
Backend: Supabase (PostgreSQL, Auth, Edge Functions)
2. Architectural Constants
Mobile-First: UI targets touch interfaces. Use SafeAreaView contexts appropriately.
Universal Compatibility: Code structure must allow for future web deployment (Expo Web).
Strict Typing: No any. All Supabase queries must use generated Database Types.
Zero-Trust Security: All data access is governed by RLS. No client-side filtering for security.
3. Database Schema & Security Strategy
The Agent will generate SQL migrations for the following schema.
3.1 Core Tables
public.organizations
id: uuid (PK)
name: text
invite_code: text (Unique, 6-char)
created_at: timestamptz
RLS: Not readable by public. Only accessible via Secure Functions.
public.profiles
id: uuid (PK, references auth.users)
full_name: text
avatar_url: text
organization_id: uuid (FK, references organizations)
role: text ('admin', 'member')
RLS: Users can view profiles in their own organization_id.
public.prayers
id: uuid (PK)
user_id: uuid (FK, references profiles)
organization_id: uuid (FK, references organizations)
content: text
is_anonymous: boolean
prayer_count: integer (default 0)
RLS: Users can view/insert prayers where organization_id matches their profile.
3.2 Security Functions
join_organization_by_code(code text):
Type: SECURITY DEFINER (Bypasses RLS)
Logic: Checks organizations for matching code. If found, updates caller's profiles.organization_id.
Grant: EXECUTE to authenticated users.
4. Frontend Implementation Plan
Phase 1: Foundation & Infrastructure
Action: Initialize Expo project with TypeScript.
Action: Configure NativeWind v4 (Metro config, Babel config, global.css).
Action: Configure TanStack Query QueryClientProvider in app/_layout.tsx.
Action: Initialize Supabase client (lib/supabase.ts) using environmental variables.
Phase 2: Authentication & Onboarding
Route: app/(auth)/sign-in.tsx
Route: app/(auth)/sign-up.tsx
Route: app/(auth)/onboarding.tsx
Logic: Interstitial screen after signup. Checks if user.organization_id is null.
UI: Input field for "Invite Code". Calls join_organization_by_code RPC.
Phase 3: The Prayer Feed (Infinite Scroll)
Route: app/(tabs)/index.tsx
Logic: useInfiniteQuery fetching from prayers table.
UI: FlatList with "Pull to Refresh".
Component: PrayerCard displaying content, user avatar (unless anonymous), and "Pray" button.
Phase 4: Mutation & Interaction
Route: app/(tabs)/compose.tsx
Logic: useMutation to insert into prayers.
Feature: Optimistic update for the UI immediately upon submission.
5. Styling "Vibe" Directives
Palette: slate-50 (background), slate-900 (text), indigo-600 (primary actions).
Typography: Clean sans-serif. Large headings (text-2xl font-bold).
Components: Cards must have shadow (shadow-sm), rounded corners (rounded-2xl), and internal padding (p-5).
Feedback: Use layout animation (LayoutAnimation or Reanimated) for prayer interactions.
6. Execution Protocol for Agent
Step 1: Generate the SQL migration file based on Section 3.
Step 2: Execute the setup commands for NativeWind and TanStack Query.
Step 3: Implement the Supabase Auth Provider context.
Step 4: Build the Onboarding/Join Flow. Verify strict type safety.
Step 5: Construct the Feed.
7. Operational Roadmap and Conclusion
7.1 Deployment Strategy (EAS)
For deployment, Expo Application Services (EAS) is the recommended path.
EAS Build: Compiles the JavaScript and native modules into .ipa and .apk files in the cloud, removing the need for a local Mac environment for iOS builds.
EAS Update: Allows for "Over-the-Air" (OTA) updates. Small JavaScript changes (e.g., fixing a typo, changing a color) can be pushed to users instantly without going through the App Store review process. This is critical for maintaining high velocity in a live church app context.20
7.2 The Hosting Question
The user explicitly queried about "Hosting."
Backend: Hosted on Supabase Cloud. No server maintenance required.
Mobile App: Hosted on Apple App Store and Google Play Store.
Web App (Optional): If the Expo Web export is used, deploy to Vercel. Vercel offers zero-config deployments for Next.js-like structures (which Expo Router emulates) and provides a global CDN for high performance.
7.3 Final Insight
The comprehensive research confirms that the "Web Developer" stack (React Native + Expo Router + NativeWind) is not merely a compromise for mobile development—it is the modern standard. By leveraging Supabase for the heavy lifting of multi-tenant security and TanStack Query for robust data synchronization, the development effort can focus almost entirely on the user interface and community features. The architecture defined in this report ensures the application is scalable, secure, and maintainable for the long term.
8. Detailed Analysis of Multi-Tenant Database Design
The success of a SaaS-style prayer app hinges on the integrity of its database design. A shared-database model, while cost-effective, requires rigorous adherence to schema patterns to prevent "tenant bleed" (data leaking between organizations).
8.1 Schema Implementation Details
In a relational database like PostgreSQL, the relationships must be explicitly defined to support the cascading security logic.
Table 2: Database Schema Relationships and Constraints
Table
Column
Type
Constraint
Purpose
organizations
id
UUID
Primary Key
The root entity.


invite_code
Text
Unique, Index
Used for lookups in the security function.
profiles
id
UUID
PK, FK (auth.users)
Links the Supabase Auth user to custom data.


organization_id
UUID
FK (organizations)
The Tenant Key. Determines user's data scope.
prayers
id
UUID
Primary Key




organization_id
UUID
FK (organizations)
The Isolation Key. Must match user's Org ID.
groups
id
UUID
Primary Key
Sub-groups within a church (e.g., "Youth Group").


organization_id
UUID
FK (organizations)
Ensures groups are strictly scoped to one church.

Critical Indexing Strategy:
Because every single query will filter by organization_id, it is mandatory to create database indexes on this column for every table.

SQL


CREATE INDEX idx_profiles_org ON public.profiles(organization_id);
CREATE INDEX idx_prayers_org ON public.prayers(organization_id);


Without these indexes, the RLS policies will force the database to perform "Sequential Scans" (reading every row) to find matches, which will degrade performance catastrophically as the data scales.
8.2 Handling "Super Admins" vs. "Church Admins"
The application will likely need different tiers of administration.
Platform Admin: Can see all churches (The App Owner).
Church Admin: Can delete prayers or ban users only within their own church.
This is handled via a role column in the profiles table. The RLS policy for DELETE operations on the prayers table would look like this:

SQL


CREATE POLICY "Admins can delete church prayers"
ON public.prayers
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);


This demonstrates the power of RLS: the business logic for "who can delete what" is baked into the database, making it enforceable regardless of which API endpoint or client is used.10
9. State Management Patterns with TanStack Query
For a web developer, the shift to mobile state management can be jarring. In the browser, the user can hit "Refresh" if data gets stale. In a mobile app, the app might stay open in the background for days. This makes stale-while-revalidate logic essential.
9.1 The Query Key Strategy
TanStack Query relies on "Query Keys" to identify data. In a multi-tenant app, the keys should be structured hierarchically.
Bad: ['prayers'] (Ambiguous if user switches orgs).
Good: ['prayers', { organizationId: '123', filter: 'recent' }].
Code Example: The Custom Hook Pattern
It is best practice to wrap queries in custom hooks to enforce consistency.

TypeScript


import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function usePrayerFeed(orgId: string) {
  return useInfiniteQuery({
    queryKey: ['prayers', orgId],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
       .from('prayers')
       .select('*')
       .eq('organization_id', orgId)
       .range(pageParam, pageParam + 9) // 10 items per page
       .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // Logic to calculate next cursor
      return lastPage.length === 10? allPages.length * 10 : undefined;
    },
  });
}


This hook encapsulates the fetching logic, the pagination logic (range), and the dependency on orgId. The component simply calls usePrayerFeed(user.orgId) and receives data, isLoading, fetchNextPage, etc.
9.2 Optimistic Updates for Interactivity
When a user clicks "Pray" on a request, the UI should update immediately. Waiting for a server round-trip (200ms+) makes the app feel sluggish.
TanStack Query handles this via onMutate.
onMutate: Cancel outgoing refetches. Snapshot the current data. Manually update the cache to show the "Prayed" status.
onError: If the server request fails, roll back to the snapshot.
onSettled: Refetch the true state from the server to ensure consistency.
This pattern creates the "snappy" feel characteristic of high-quality native apps.16
10. Styling Architecture: NativeWind Best Practices
NativeWind facilitates a shared design system. To maintain a cohesive "Vibe," the project should leverage the tailwind.config.js to define semantic tokens.
10.1 Semantic Configuration
Instead of using raw colors (bg-blue-500), define semantic names in the config.

JavaScript


// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo 600
        surface: '#F8FAFC', // Slate 50
        'surface-highlight': '#FFFFFF',
      }
    }
  }
}


Now, components use bg-surface or text-primary. If the church decides to rebrand from Blue to Purple, you only change the hex code in the config, and the entire app updates.
10.2 Handling Platform Differences
Sometimes, iOS and Android require different spacing or shadows. NativeWind supports platform prefixes.
ios:pt-4: Adds padding-top only on iOS (e.g., to handle the notch if not using SafeAreaView).
android:pt-8: Adds different padding on Android.
This allows for fine-tuning the native experience while sharing 95% of the styling code.14
11. Comprehensive "Vibe Coding" Workflow
The "Vibe Coding" methodology transforms the developer's role. Instead of writing boilerplate, the developer focuses on high-level orchestration.
11.1 The Agentic Lifecycle
Drafting: The developer writes the MISSION.md (as provided in Section 6). This is the "Constitution" of the project.
Initialization: The AntiGravity agent reads the mission and scaffolds the project. It sets up the directory structure, installs dependencies, and creates the configuration files.
Review: The developer reviews the generated code. Does the app/_layout.tsx look correct? Are the navigation stacks nested properly?
Iteration: The developer prompts for specific features. "Agent, based on the schema in MISSION.md, create the PrayerCard component. Ensure it handles the anonymous state gracefully."
Refinement: The developer manually tweaks the UI for that perfect "Vibe"—adjusting padding, softening shadows, fine-tuning animation curves.
11.2 Why This Works for Web Developers
This workflow mitigates the "Unknown Unknowns." A web developer might not know that React Native FlatList requires a specific contentContainerStyle for padding. The Agent does know this. By letting the Agent handle the implementation details, the developer bypasses common pitfalls and focuses on the application logic and user experience.24
12. Final Architecture Summary
The research concludes that the proposed architecture is not only viable but optimal for the stated goals.
Framework: Expo Router eliminates the need for Next.js, providing a native-first routing experience that feels familiar to web developers.
Backend: Supabase offers the necessary relational data integrity and robust security (RLS) required for multi-tenancy, with a pricing model that scales predictably.
Styling & State: NativeWind and TanStack Query provide a high-velocity developer experience, abstracting away the complexities of native styling and network synchronization.
Development: The AntiGravity "Vibe Coding" approach leverages AI to handle the boilerplate, ensuring best practices are followed from line one.
