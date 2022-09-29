import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';

import axios from "axios";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

interface IAlbum {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
}

const FEED_URL = 'https://jsonplaceholder.typicode.com/albums/1/photos';

const getFeed = async () => {
    try {   
      const response = await axios.get(FEED_URL);
      return Promise.resolve(response.data);
    } catch (error) {
      return Promise.reject(error);
    }
  }

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));



const VaultPage: NextPage = () => {
    const [feed, setFeed] = useState<IAlbum[]>();

    useEffect(() => {
        getFeed()
            .then((response) => setFeed(response))
            .catch((error) => {
                console.error(error);
                setFeed(undefined);
            }); 
    }, []);

    return <>
        <Box sx={{ margin: 5, flexGrow: 1 }}>
            <Grid container spacing={2}>
                {
                    feed?.map((item) => <>
                    <Grid key={item.id} item xs={3}>
                        <Item>
                            <a href={item.url} target="_blank"><img src={item.thumbnailUrl} alt={`Placeholder ${item.id}`}/></a>
                        </Item>
                    </Grid>
                    </>)
                }
            </Grid>
        </Box>
    </>
};

export default VaultPage;
