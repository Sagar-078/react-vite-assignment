import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const DataTableComponent: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputRows, setInputRows] = useState<number | null>(null);

  useEffect(() => {
    fetchArtworks(currentPage);
  }, [currentPage]);

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
    setArtworks(response.data.data);
    setTotalRecords(response.data.pagination.total_pages);
    setLoading(false);
  };

  const onPageChange = (event: any) => {
    setCurrentPage(event.page + 1);
  };

  const onRowSelect = (e: any) => {
    setSelectedArtworks([...selectedArtworks, e.data]);
  };

  const onRowUnselect = (e: any) => {
    setSelectedArtworks(selectedArtworks.filter((artwork) => artwork.id !== e.data.id));
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    let rowsToSelect: Artwork[] = [];
    let rowsNeeded = inputRows ?? 0;

    rowsToSelect = [...artworks.slice(0, rowsNeeded)];

    let nextPage = currentPage + 1;

    while (rowsToSelect.length < rowsNeeded) {
      const remainingRows = rowsNeeded - rowsToSelect.length;
      const nextPageData = await fetchMoreRows(nextPage, remainingRows);

      if (nextPageData.length === 0) {
        break;
      }

      rowsToSelect = [...rowsToSelect, ...nextPageData];
      nextPage += 1;
    }

  setSelectedArtworks(rowsToSelect);
    setIsModalOpen(false);
  };

  const fetchMoreRows = async (page: number, rowsNeeded: number) => {
    setLoading(true);
    const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
    setLoading(false);
    return response.data.data.slice(0, rowsNeeded);
  };

  const titleHeaderTemplate = (
    <div className="flex align-items-center">
      <i className="pi pi-angle-down" onClick={openModal} style={{ cursor: 'pointer', marginRight: '10px' }}></i>

      <span>Title</span>
    </div>
  );

  return (
    <div className="p-4">
      {/* Modal */}
      <Dialog header="Select Number of Rows" visible={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <div className="p-field" style={{ marginBottom: '20px' }}>

          <InputNumber
            value={inputRows}
            onValueChange={(e:any) => setInputRows(e.value)}
            id="rows"
            placeholder="Select number of rows"
            className="no-spinner"
          />
        </div>

        {/* Buttons with gap */}
        <div className="p-d-flex p-jc-between" >
          <Button label="Submit" icon="pi pi-check" onClick={handleSubmit} />
        </div>
      </Dialog>

      <DataTable
        value={artworks}
        paginator
        rows={12}
        totalRecords={totalRecords}
        lazy
        first={(currentPage - 1) * 12}
        onPage={onPageChange}
        selection={selectedArtworks}
        onSelectionChange={(e: any) => setSelectedArtworks(e.value)}
        onRowSelect={onRowSelect}
        onRowUnselect={onRowUnselect}
        dataKey="id"
        loading={loading}
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
        
        <Column field="title" header={titleHeaderTemplate}></Column>
        
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>
    </div>
  );
};

export default DataTableComponent;