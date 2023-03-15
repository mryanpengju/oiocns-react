import CustomStore from 'devextreme/data/custom_store';

export const store = new CustomStore({
    key: 'OrderNumber',
    load(loadOptions) {
        let params = '?';
        [
            'skip',
            'take',
            'requireTotalCount',
            'requireGroupCount',
            'sort',
            'filter',
            'totalSummary',
            'group',
            'groupSummary',
        ].forEach((i) => {
            if (i in loadOptions && isNotEmpty(loadOptions[i])) {
                params += `${i}=${JSON.stringify(loadOptions[i])}&`;
            }
        });
        params = params.slice(0, -1);
        return fetch(
            `https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders${params}`,
        )
            .then((response) => response.json())
            .then((data) => ({
                data: data.data,
                totalCount: data.totalCount,
                summary: data.summary,
                groupCount: data.groupCount,
            }))
            .catch(() => {
                throw new Error('Data Loading Error');
            });
    },
});
