import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { restaurantsAPI } from "@/lib/api";
import { toast } from "sonner";
import { Settings as SettingsIcon, Users, Save } from "lucide-react";

interface Restaurant {
  id;
  name;
  capacity;
  available_seats;
  status;
}

const Settings = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [seatsData, setSeatsData] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantsAPI.getAll("active");
      
      // Sort by name
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      const restaurantsData = sorted.map(r => ({
        id: r.id,
        name: r.name,
        capacity: r.capacity,
        available_seats: r.available_seats,
        status: r.status || 'active'
      }));
      
      setRestaurants(restaurantsData);
      
      // Initialize seats data
      const initialSeatsData: Record<string, number> = {};
      restaurantsData.forEach((restaurant) => {
        initialSeatsData[restaurant.id] = restaurant.available_seats;
      });
      setSeatsData(initialSeatsData);
    } catch (error) {
      toast.error("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatChange = (restaurantId, value) => {
    const numValue = parseInt(value) || 0;
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    
    if (restaurant) {
      // Ensure seats don't exceed capacity
      const maxSeats = restaurant.capacity;
      const newValue = Math.max(0, Math.min(numValue, maxSeats));
      
      setSeatsData({
        ...seatsData,
        [restaurantId]: newValue,
      });
    }
  };

  const handleSaveSeats = async (restaurantId) => {
    const newSeats = seatsData[restaurantId];
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    
    if (!restaurant) return;
    
    if (newSeats < 0 || newSeats > restaurant.capacity) {
      toast.error(`Seats must be between 0 and ${restaurant.capacity}`);
      return;
    }

    try {
      setLoading(true);
      await restaurantsAPI.update(restaurantId, { available_seats: newSeats });
      
      toast.success(`Available seats updated for ${restaurant.name}`);
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to update seats");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      const updates = Object.entries(seatsData).map(async ([restaurantId, seats]) => {
        const restaurant = restaurants.find((r) => r.id === restaurantId);
        if (!restaurant) return;
        
        if (seats < 0 || seats > restaurant.capacity) {
          toast.error(`${restaurant.name}: Seats must be between 0 and ${restaurant.capacity}`);
          return;
        }
        
        return restaurantsAPI.update(restaurantId, { available_seats: seats });
      });

      await Promise.all(updates);
      
      toast.success("All seats updated successfully");
      fetchRestaurants();
    } catch (error) {
      toast.error("Failed to update seats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Restaurant Seats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && restaurants.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading restaurants...</p>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No active restaurants found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={handleSaveAll} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </Button>
              </div>
              
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Restaurant Name</TableHead>
                      <TableHead className="text-center">Total Capacity</TableHead>
                      <TableHead className="text-center">Current Available Seats</TableHead>
                      <TableHead className="text-center">New Available Seats</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">
                          {restaurant.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">{restaurant.capacity}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{restaurant.available_seats}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={restaurant.capacity}
                              value={seatsData[restaurant.id] ?? restaurant.available_seats}
                              onChange={(e) => handleSeatChange(restaurant.id, e.target.value)}
                              className="w-24 text-center"
                              disabled={loading}
                            />
                            <span className="text-sm text-muted-foreground">
                              / {restaurant.capacity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => handleSaveSeats(restaurant.id)}
                            disabled={loading || seatsData[restaurant.id] === restaurant.available_seats}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

