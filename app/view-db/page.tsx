"use client";

import { useMemo, useState } from "react";

type Target = "local" | "prod";

type ColumnInfo = {
  column_name: string;
  data_type: string;
};

type TableResponse = {
  table: string;
  columns: ColumnInfo[];
  primaryKeys: string[];
  rows: Record<string, unknown>[];
  page: number;
  pageSize: number;
  total: number;
};

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

export default function ViewDbPage() {
  const [target, setTarget] = useState<Target>("local");
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableResponse | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createPayload, setCreatePayload] = useState("{}");

  const totalPages = useMemo(() => {
    if (!tableData) return 1;
    return Math.max(1, Math.ceil(tableData.total / tableData.pageSize));
  }, [tableData]);

  const loadTables = async () => {
    setLoadingTables(true);
    setError(null);
    try {
      const response = await fetch(`/api/db/tables?target=${target}`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить список таблиц.");
      }
      const data = (await response.json()) as { tables: string[] };
      setTables(data.tables);
      setSelectedTable(null);
      setTableData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingTables(false);
    }
  };

  const loadTable = async (table: string, nextPage = page) => {
    setLoadingTable(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        target,
        name: table,
        page: String(nextPage),
        pageSize: String(pageSize),
      });
      const response = await fetch(`/api/db/table?${params}`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить таблицу.");
      }
      const data = (await response.json()) as TableResponse;
      setTableData(data);
      setSelectedTable(table);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingTable(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedTable) return;
    try {
      const payload = JSON.parse(createPayload) as Record<string, unknown>;
      const response = await fetch("/api/db/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, table: selectedTable, data: payload }),
      });
      if (!response.ok) {
        throw new Error("Не удалось создать запись.");
      }
      await loadTable(selectedTable, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка в JSON.");
    }
  };

  const handleUpdate = async (row: Record<string, unknown>) => {
    if (!tableData || tableData.primaryKeys.length === 0 || !selectedTable) {
      setError("Нет первичного ключа для обновления.");
      return;
    }
    const defaultPayload = JSON.stringify(row, null, 2);
    const updated = window.prompt("JSON для обновления строки:", defaultPayload);
    if (!updated) return;

    try {
      const payload = JSON.parse(updated) as Record<string, unknown>;
      const where: Record<string, unknown> = {};
      tableData.primaryKeys.forEach((key) => {
        where[key] = row[key];
      });
      const response = await fetch("/api/db/table", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          table: selectedTable,
          data: payload,
          where,
        }),
      });
      if (!response.ok) {
        throw new Error("Не удалось обновить запись.");
      }
      await loadTable(selectedTable, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка в JSON.");
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    if (!tableData || tableData.primaryKeys.length === 0 || !selectedTable) {
      setError("Нет первичного ключа для удаления.");
      return;
    }
    const confirmed = window.confirm("Удалить запись?");
    if (!confirmed) return;

    const where: Record<string, unknown> = {};
    tableData.primaryKeys.forEach((key) => {
      where[key] = row[key];
    });
    const response = await fetch("/api/db/table", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, table: selectedTable, where }),
    });
    if (!response.ok) {
      setError("Не удалось удалить запись.");
      return;
    }
    await loadTable(selectedTable, page);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">view-db</h1>
          <p className="text-sm text-muted-foreground">
            Выберите базу, список таблиц и выполните CRUD операции.
          </p>
        </div>

        <section className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              База данных:
              <select
                className="rounded border bg-background px-2 py-1"
                value={target}
                onChange={(event) => {
                  setTarget(event.target.value as Target);
                  setTables([]);
                  setSelectedTable(null);
                  setTableData(null);
                }}
              >
                <option value="local">Local</option>
                <option value="prod">Prod</option>
              </select>
            </label>
            <button
              className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              onClick={loadTables}
              disabled={loadingTables}
            >
              {loadingTables ? "Загрузка..." : "Загрузить таблицы"}
            </button>
          </div>

          {tables.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tables.map((table) => (
                <div
                  key={table}
                  className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                >
                  <span>{table}</span>
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => loadTable(table, 1)}
                    disabled={loadingTable}
                  >
                    Открыть
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {selectedTable && tableData && (
          <section className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{tableData.table}</h2>
                <p className="text-xs text-muted-foreground">
                  PK:{" "}
                  {tableData.primaryKeys.length > 0
                    ? tableData.primaryKeys.join(", ")
                    : "не найден"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="rounded border px-2 py-1"
                  disabled={page <= 1}
                  onClick={() => loadTable(selectedTable, page - 1)}
                >
                  Назад
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  className="rounded border px-2 py-1"
                  disabled={page >= totalPages}
                  onClick={() => loadTable(selectedTable, page + 1)}
                >
                  Вперед
                </button>
                <select
                  className="rounded border bg-background px-2 py-1"
                  value={pageSize}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    setPageSize(next);
                    loadTable(selectedTable, 1);
                  }}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} / стр.
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 overflow-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {tableData.columns.map((column) => (
                      <th
                        key={column.column_name}
                        className="border-b px-3 py-2 text-left font-medium"
                      >
                        {column.column_name}
                      </th>
                    ))}
                    <th className="border-b px-3 py-2 text-left font-medium">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, idx) => (
                    <tr key={idx} className="border-b">
                      {tableData.columns.map((column) => (
                        <td key={column.column_name} className="px-3 py-2">
                          {formatValue(row[column.column_name])}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            className="rounded border px-2 py-1 text-xs"
                            onClick={() => handleUpdate(row)}
                            disabled={tableData.primaryKeys.length === 0}
                          >
                            Редактировать
                          </button>
                          <button
                            className="rounded border border-destructive/50 px-2 py-1 text-xs text-destructive"
                            onClick={() => handleDelete(row)}
                            disabled={tableData.primaryKeys.length === 0}
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tableData.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={tableData.columns.length + 1}
                        className="px-3 py-6 text-center text-sm text-muted-foreground"
                      >
                        Нет данных.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold">Создать запись</h3>
              <textarea
                className="mt-2 h-32 w-full rounded border bg-background p-2 font-mono text-xs"
                value={createPayload}
                onChange={(event) => setCreatePayload(event.target.value)}
              />
              <button
                className="mt-2 rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                onClick={handleCreate}
              >
                Создать
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
