import { useState, useEffect, useCallback } from 'react';
import { usePagination, UsePaginationReturn } from './usePagination';
import { cachedApiClient } from '@/api/cachedClient';

export interface TableDataConfig {
  endpoint: string;
  defaultParams?: Record<string, any>;
  cacheOptions?: {
    ttl?: number;
    forceRefresh?: boolean;
  };
  dependencies?: any[];
  pagination?: {
    defaultLimit?: number;
    availableLimits?: number[];
  };
  autoLoad?: boolean; // if false, data is only loaded when actions.loadData/refresh are called
}

export interface TableDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

export interface TableDataActions {
  refresh: () => Promise<void>;
  loadData: (forceRefresh?: boolean) => Promise<void>;
  updateFilters: (filters: Record<string, any>) => void;
}

export interface UseTableDataReturn<T> extends UsePaginationReturn {
  state: TableDataState<T>;
  actions: TableDataActions & UsePaginationReturn['actions'];
  filters: Record<string, any>;
}

export const useTableData = <T = any>(config: TableDataConfig): UseTableDataReturn<T> => {
  const pagination = usePagination(config.pagination);
  const [filters, setFilters] = useState<Record<string, any>>(config.defaultParams || {});
  
  const [state, setState] = useState<TableDataState<T>>({
    data: [],
    loading: false,
    error: null,
    lastRefresh: null
  });

  const buildParams = useCallback(() => {
    const apiParams = pagination.getApiParams();
    return {
      ...config.defaultParams,
      ...filters,
      ...apiParams
    };
  }, [filters, pagination, config.defaultParams]);

  const loadData = useCallback(async (forceRefresh = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = buildParams();
      console.log(`Loading data from ${config.endpoint}:`, params);
      
      const result = await cachedApiClient.get(
        config.endpoint, 
        params, 
        {
          ttl: config.cacheOptions?.ttl || 15,
          forceRefresh
        }
      );

      console.log('Table data loaded successfully:', result);
      
      // Handle both array response and paginated response
      const data = Array.isArray(result) ? result : (result as any)?.data || [];
      const total = Array.isArray(result) ? result.length : (result as any)?.meta?.total || data.length;
      
      pagination.actions.setTotalCount(total);
      
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        lastRefresh: new Date()
      }));
      
    } catch (error) {
      console.error(`Failed to load data from ${config.endpoint}:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    }
  }, [buildParams, config.endpoint, config.cacheOptions, pagination]);

  const refresh = useCallback(() => loadData(true), [loadData]);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    pagination.actions.setPage(0); // Reset to first page when filters change
  }, [pagination]);

// Auto-load data when enabled and any dependency changes
useEffect(() => {
  if (config.autoLoad === false) return;
  loadData(false);
}, [pagination.pagination.page, pagination.pagination.limit, ...(config.dependencies || [])]);

  return {
    ...pagination,
    state,
    actions: {
      ...pagination.actions,
      refresh,
      loadData,
      updateFilters
    },
    filters
  };
};