import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../mqtt-client/edge-workers'))

import edgebridge_bocce

class TestEdgeBridgeBocce(unittest.TestCase):

    def setUp(self):
        edgebridge_bocce.PARTITA_ATTIVA = None

    def test_on_message_comando_avvio(self):
        mock_client = MagicMock()
        
        mock_msg = MagicMock()
        mock_msg.topic = edgebridge_bocce.MQTT_TOPIC_COMANDI
        payload = {"nuova_partita_id": 42}
        mock_msg.payload = json.dumps(payload).encode('utf-8')
        
        edgebridge_bocce.on_message(mock_client, None, mock_msg)
        
        self.assertEqual(edgebridge_bocce.PARTITA_ATTIVA, 42)

    @patch('edgebridge_bocce.requests.put')
    @patch('edgebridge_bocce.time.sleep')
    def test_on_message_punteggio_bocce(self, mock_sleep, mock_put):
        edgebridge_bocce.PARTITA_ATTIVA = 42
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_put.return_value = mock_response

        mock_client = MagicMock()
        mock_msg = MagicMock()
        mock_msg.topic = edgebridge_bocce.MQTT_TOPIC_PUNTEGGIO
        
        # Simuliamo 2 punti per la squadra ROSSO
        payload = {
            "squadra_vincitrice": "ROSSO",
            "punti": 2
        }
        mock_msg.payload = json.dumps(payload).encode('utf-8')
        
        edgebridge_bocce.on_message(mock_client, None, mock_msg)
        
        # Dovrebbe chiamare put 2 volte
        self.assertEqual(mock_put.call_count, 2)
        
        # Verifichiamo che idSquadra = 2 (ROSSO)
        args, kwargs = mock_put.call_args_list[0]
        self.assertTrue(str(42) in args[0])
        self.assertEqual(kwargs['params']['idSquadra'], edgebridge_bocce.MAPPA_SQUADRE["ROSSO"])

if __name__ == '__main__':
    unittest.main()
