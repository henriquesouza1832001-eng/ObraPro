export type CourseAccessType = 'free' | 'premium';

export interface CourseSummary {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    level: string;
    accessType: CourseAccessType;
    priceCents: number | null;
    durationMinutes: number;
    isFeatured: boolean;
}

export interface CourseModule {
    id: string;
    position: number;
    title: string;
    description: string;
    lessons: LessonSummary[];
}

export interface LessonSummary {
    id: string;
    position: number;
    title: string;
    summary: string;
    durationMinutes: number;
    isFree: boolean;
}

export interface CourseDetails extends CourseSummary {
    modules: CourseModule[];
}
