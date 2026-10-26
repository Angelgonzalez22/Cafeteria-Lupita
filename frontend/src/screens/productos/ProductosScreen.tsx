/* CATÁLOGO DE PRODUCTOS DE ADMINISTRACIÓN */

import { useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SkeletonRefreshControl } from "../../components/common/SkeletonRefreshControl";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSkeleton } from "../../components/common/LoadingSkeleton";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { SectionHeader } from "../../components/layout/SectionHeader";
import { ProductCard } from "../../components/productos/ProductCard";
import { spacing } from "../../constants/spacing";
import { useProductos } from "../../hooks/productos/useProductos";
import { useResponsive } from "../../hooks/useResponsive";
import type { ProductoResponse } from "../../models/productos/producto";

export const ProductosScreen = () => {
  const catalogo = useProductos();
  const { horizontalPadding, maxContentWidth } = useResponsive();
  const list = useRef<FlatList<ProductoResponse>>(null);

  const handlePageChange = (page: number) => {
    catalogo.goToPage(page);
    list.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchInput
        label="Buscar producto"
        value={catalogo.search}
        onChangeText={catalogo.setSearch}
        loading={catalogo.searching}
      />
      {catalogo.error && catalogo.productos.length > 0 && (
        <EmptyState
          title={catalogo.error.titulo}
          message={catalogo.error.mensaje}
          onAction={catalogo.refresh}
          loading={catalogo.refreshing}
        />
      )}
    </View>
  );

  const renderEmpty = () => {
    if (catalogo.loading) return <LoadingSkeleton variant="product" />;

    return (
      <EmptyState
        title={catalogo.error?.titulo ?? "No hay productos"}
        message={catalogo.error?.mensaje ?? "Los productos del catálogo aparecerán aquí."}
        onAction={catalogo.error ? catalogo.refresh : undefined}
        loading={catalogo.refreshing}
      />
    );
  };

  return (
    <ScreenWrapper
      padded={false}
      edges={[]}
      contentStyle={styles.root}
    >
      <SectionHeader
        title="Productos"
      />
      <FlatList
        ref={list}
        data={catalogo.loading ? [] : catalogo.productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard producto={item} />}
        contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPadding, maxWidth: maxContentWidth }]}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty()}
        ListFooterComponent={(
          <Pagination
            pagination={catalogo.pagination}
            page={catalogo.page}
            onPageChange={handlePageChange}
            loading={catalogo.pageLoading}
            disabled={catalogo.searching}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <SkeletonRefreshControl
            onRefresh={catalogo.refresh}
          />
        }
        keyboardShouldPersistTaps="handled"
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  root: {
    maxWidth: "100%",
  },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.base,
  },
  list: {
    width: "100%",
    alignSelf: "center",
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
});
