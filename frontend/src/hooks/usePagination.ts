/* PÁGINA ACTUAL POR BÚSQUEDA Y FILTROS */

import { useCallback, useState } from "react";
import type { PaginationMetadata } from "../models/common/pagination";

export const usePagination = (scope: string) => {
  const [selection, setSelection] = useState({ scope, page: 1 });
  const [known, setKnown] = useState<{ scope: string; data: PaginationMetadata } | null>(null);
  const page = selection.scope === scope ? selection.page : 1;

  if (selection.scope !== scope) {
    setSelection({ scope, page: 1 });
  }

  const goToPage = useCallback((next: number) => {
    if (Number.isSafeInteger(next) && next >= 1) {
      setSelection({ scope, page: next });
    }
  }, [scope]);

  const rememberPagination = useCallback((data: PaginationMetadata) => {
    setKnown((current) => current?.scope === scope && current.data === data ? current : { scope, data });
  }, [scope]);

  return {
    page,
    goToPage,
    rememberPagination,
    pagination: known?.scope === scope ? known.data : undefined,
  };
};
