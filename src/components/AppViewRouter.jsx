import BuyView from '../views/BuyView';
import CompanyView from '../views/CompanyView';
import OrganizerView from '../views/OrganizerView';
import RegisterView from '../views/RegisterView';
import StationsView from '../views/StationsView';
import WarehousesView from '../views/WarehousesView';
import WorkforceView from '../views/WorkforceView';
import AutomationView from '../views/AutomationView';

const AppViewRouter = ({
  view,
  currentUser,
  inventory,
  storeInventory,
  setInventory,
  setStoreInventory,
  shelves,
  setShelves,
  stations,
  stationBlueprints,
  setStations,
  warehouses,
  products,
  setProducts,
  productsForSale,
  publicSaleProducts,
  cartItems,
  draggedItem,
  isDraggable,
  company,
  workforce,
  dayConfig,
  setDayConfig,
  currentDayTime,
  isClockRunning,
  setIsClockRunning,
  currentDay,
  currentDate,
  dailyBalance,
  globalBalance,
  automationConfig,
  automationLog,
  canSleep,
  finishDay,
  actions,
}) => {
  switch (view) {
    case 'organizer':
      return (
        <OrganizerView
          shelves={shelves}
          inventorySummary={actions.getInventorySummary()}
          inventory={currentUser === 'store' ? storeInventory : inventory}
          setShelves={setShelves}
          setInventory={currentUser === 'store' ? setStoreInventory : setInventory}
          handleDragStart={actions.handleDragStart}
          handleDragOver={actions.handleDragOver}
          handleDragLeave={actions.handleDragLeave}
          handleDrop={actions.handleDrop}
          handleDropToInventory={actions.handleDropToInventory}
          handleDropToTrash={actions.handleDropToTrash}
          setMessage={actions.setMessage}
          setDraggedItem={actions.setDraggedItem}
          draggedItem={draggedItem}
          isDraggable={isDraggable}
          moveItemToSale={actions.moveItemToSale}
          currentUser={currentUser}
          openRequestModal={actions.openRequestModal}
        />
      );
    case 'register':
      return currentUser === 'store' ? (
        <RegisterView handleProductFormSubmit={actions.handleProductFormSubmit} />
      ) : (
        <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-700">
            Esta función solo está disponible para el Usuario Tienda.
          </p>
        </div>
      );
    case 'buy':
      return (
        <BuyView
          products={products}
          setProducts={setProducts}
          handleAddToCartAll={actions.handleAddToCartAll}
          stations={stations}
          cartItems={cartItems}
          setIsCartOpen={actions.setIsCartOpen}
          productsForSale={productsForSale}
          publicSaleProducts={publicSaleProducts}
          currentUser={currentUser}
          removeItemFromSale={actions.removeItemFromSale}
          warehouses={warehouses}
        />
      );
    case 'stations':
      return (
        <StationsView
          inventory={inventory}
          blueprints={stationBlueprints}
          stations={stations}
          company={company}
          handleStationFormSubmit={actions.handleStationFormSubmit}
          handleDeleteStation={actions.handleDeleteStation}
          handleBuildStation={actions.handleBuildStation}
        />
      );
    case 'warehouses':
      return (
        <WarehousesView
          warehouses={warehouses}
          stations={stations}
          setStations={setStations}
          handleWarehouseFormSubmit={actions.handleWarehouseFormSubmit}
          handleDragStart={actions.handleDragStart}
          handleDragOver={actions.handleDragOver}
          handleDragLeave={actions.handleDragLeave}
          handleStationDrop={actions.handleStationDrop}
          handleDropToAvailableStations={actions.handleDropToAvailableStations}
          openStationDetailsModal={actions.openStationDetailsModal}
          draggedItem={draggedItem}
          setMessage={actions.setMessage}
        />
      );
    case 'company':
      return (
        <CompanyView
          company={company}
          createCompany={actions.createCompany}
          dayConfig={dayConfig}
          setDayConfig={setDayConfig}
          currentDayTime={currentDayTime}
          isClockRunning={isClockRunning}
          setIsClockRunning={setIsClockRunning}
          currentDay={currentDay}
          currentDate={currentDate}
          canSleep={canSleep()}
          finishDay={finishDay}
          dailyBalance={dailyBalance}
          globalBalance={globalBalance}
          updateCompany={actions.updateCompany}
          deleteCompany={actions.deleteCompany}
        />
      );
    case 'workforce':
      return <WorkforceView workforce={workforce} addActor={actions.addActor} />;
    case 'automation':
      return (
        <AutomationView
          config={automationConfig}
          setConfig={actions.setAutomationConfig}
          log={automationLog}
          clearLog={actions.clearAutomationLog}
        />
      );
    default:
      return null;
  }
};

export default AppViewRouter;
