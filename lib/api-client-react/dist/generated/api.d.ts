import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Comment, CommentInput, HealthStatus, ListTasksParams, MyStats, OverviewStats, Task, TaskInput, TaskUpdate, User } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListTasksUrl: (params?: ListTasksParams) => string;
/**
 * Admin sees all tasks; Staff sees only assigned tasks
 * @summary List tasks
 */
export declare const listTasks: (params?: ListTasksParams, options?: RequestInit) => Promise<Task[]>;
export declare const getListTasksQueryKey: (params?: ListTasksParams) => readonly ["/api/tasks", ...ListTasksParams[]];
export declare const getListTasksQueryOptions: <TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListTasksQueryResult = NonNullable<Awaited<ReturnType<typeof listTasks>>>;
export type ListTasksQueryError = ErrorType<unknown>;
/**
 * @summary List tasks
 */
export declare function useListTasks<TData = Awaited<ReturnType<typeof listTasks>>, TError = ErrorType<unknown>>(params?: ListTasksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listTasks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateTaskUrl: () => string;
/**
 * @summary Create a new task (Admin only)
 */
export declare const createTask: (taskInput: TaskInput, options?: RequestInit) => Promise<Task>;
export declare const getCreateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<TaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<TaskInput>;
}, TContext>;
export type CreateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof createTask>>>;
export type CreateTaskMutationBody = BodyType<TaskInput>;
export type CreateTaskMutationError = ErrorType<unknown>;
/**
* @summary Create a new task (Admin only)
*/
export declare const useCreateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createTask>>, TError, {
        data: BodyType<TaskInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createTask>>, TError, {
    data: BodyType<TaskInput>;
}, TContext>;
export declare const getGetTaskUrl: (taskId: string) => string;
/**
 * @summary Get a single task by ID
 */
export declare const getTask: (taskId: string, options?: RequestInit) => Promise<Task>;
export declare const getGetTaskQueryKey: (taskId: string) => readonly [`/api/tasks/${string}`];
export declare const getGetTaskQueryOptions: <TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<unknown>>(taskId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTaskQueryResult = NonNullable<Awaited<ReturnType<typeof getTask>>>;
export type GetTaskQueryError = ErrorType<unknown>;
/**
 * @summary Get a single task by ID
 */
export declare function useGetTask<TData = Awaited<ReturnType<typeof getTask>>, TError = ErrorType<unknown>>(taskId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTask>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateTaskUrl: (taskId: string) => string;
/**
 * @summary Update a task (Admin can update all; Staff can only update status)
 */
export declare const updateTask: (taskId: string, taskUpdate: TaskUpdate, options?: RequestInit) => Promise<Task>;
export declare const getUpdateTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, {
        taskId: string;
        data: BodyType<TaskUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, {
    taskId: string;
    data: BodyType<TaskUpdate>;
}, TContext>;
export type UpdateTaskMutationResult = NonNullable<Awaited<ReturnType<typeof updateTask>>>;
export type UpdateTaskMutationBody = BodyType<TaskUpdate>;
export type UpdateTaskMutationError = ErrorType<unknown>;
/**
* @summary Update a task (Admin can update all; Staff can only update status)
*/
export declare const useUpdateTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateTask>>, TError, {
        taskId: string;
        data: BodyType<TaskUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateTask>>, TError, {
    taskId: string;
    data: BodyType<TaskUpdate>;
}, TContext>;
export declare const getDeleteTaskUrl: (taskId: string) => string;
/**
 * @summary Delete a task (Admin only)
 */
export declare const deleteTask: (taskId: string, options?: RequestInit) => Promise<void>;
export declare const getDeleteTaskMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, {
        taskId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, {
    taskId: string;
}, TContext>;
export type DeleteTaskMutationResult = NonNullable<Awaited<ReturnType<typeof deleteTask>>>;
export type DeleteTaskMutationError = ErrorType<unknown>;
/**
* @summary Delete a task (Admin only)
*/
export declare const useDeleteTask: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteTask>>, TError, {
        taskId: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteTask>>, TError, {
    taskId: string;
}, TContext>;
export declare const getListCommentsUrl: (taskId: string) => string;
/**
 * @summary List comments for a task
 */
export declare const listComments: (taskId: string, options?: RequestInit) => Promise<Comment[]>;
export declare const getListCommentsQueryKey: (taskId: string) => readonly [`/api/tasks/${string}/comments`];
export declare const getListCommentsQueryOptions: <TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(taskId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCommentsQueryResult = NonNullable<Awaited<ReturnType<typeof listComments>>>;
export type ListCommentsQueryError = ErrorType<unknown>;
/**
 * @summary List comments for a task
 */
export declare function useListComments<TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(taskId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAddCommentUrl: (taskId: string) => string;
/**
 * @summary Add a comment to a task
 */
export declare const addComment: (taskId: string, commentInput: CommentInput, options?: RequestInit) => Promise<Comment>;
export declare const getAddCommentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addComment>>, TError, {
        taskId: string;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof addComment>>, TError, {
    taskId: string;
    data: BodyType<CommentInput>;
}, TContext>;
export type AddCommentMutationResult = NonNullable<Awaited<ReturnType<typeof addComment>>>;
export type AddCommentMutationBody = BodyType<CommentInput>;
export type AddCommentMutationError = ErrorType<unknown>;
/**
* @summary Add a comment to a task
*/
export declare const useAddComment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof addComment>>, TError, {
        taskId: string;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof addComment>>, TError, {
    taskId: string;
    data: BodyType<CommentInput>;
}, TContext>;
export declare const getListUsersUrl: () => string;
/**
 * @summary List all users in the organization (Admin only)
 */
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users in the organization (Admin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetOverviewStatsUrl: () => string;
/**
 * @summary Admin dashboard — task totals and breakdowns
 */
export declare const getOverviewStats: (options?: RequestInit) => Promise<OverviewStats>;
export declare const getGetOverviewStatsQueryKey: () => readonly ["/api/stats/overview"];
export declare const getGetOverviewStatsQueryOptions: <TData = Awaited<ReturnType<typeof getOverviewStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOverviewStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getOverviewStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetOverviewStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getOverviewStats>>>;
export type GetOverviewStatsQueryError = ErrorType<unknown>;
/**
 * @summary Admin dashboard — task totals and breakdowns
 */
export declare function useGetOverviewStats<TData = Awaited<ReturnType<typeof getOverviewStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getOverviewStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMyStatsUrl: () => string;
/**
 * @summary Current user's personal task stats
 */
export declare const getMyStats: (options?: RequestInit) => Promise<MyStats>;
export declare const getGetMyStatsQueryKey: () => readonly ["/api/stats/my"];
export declare const getGetMyStatsQueryOptions: <TData = Awaited<ReturnType<typeof getMyStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMyStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMyStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getMyStats>>>;
export type GetMyStatsQueryError = ErrorType<unknown>;
/**
 * @summary Current user's personal task stats
 */
export declare function useGetMyStats<TData = Awaited<ReturnType<typeof getMyStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMyStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map