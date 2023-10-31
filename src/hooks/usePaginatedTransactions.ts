import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithoutCache , loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)
  // Bug 7: Approving a transaction won't persist the new value
  //I check the methods in the useCoustomFetch.ts file, there is fetchwithCache and fetchWioutCatch, 
  //choose the fetchWithoutCatch will fix this error. 
  //and also need to change in hte userTransactionByEmployee.ts file 
  const fetchAll = useCallback(async () => {
    const response = await fetchWithoutCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }
      //Bug 4: Clicking on View More button not showing correct data.
      //we need return the data that corrsponse with previousResponse with previousReponse data
      return { data: [...previousResponse.data, ...response.data], nextPage: response.nextPage }
    })//change it to fetchWithoutCache in bug 4 code because of bug 7
  }, [ fetchWithoutCache , paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
